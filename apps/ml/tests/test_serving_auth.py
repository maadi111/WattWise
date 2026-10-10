"""The ML service must not be callable without a real secret, and must refuse nonsensical inputs."""
import importlib

import pytest
from fastapi.testclient import TestClient

GOOD_TOKEN = "k3J9xQ2mZp7vLw4NfT8aRb6YdH1sUc5E-longenough"  # 44 chars, random-looking, no placeholder text
PUBLIC_OLD_DEFAULT = "wattwise-ml-internal-service-token-2026"


def load_app(monkeypatch, env, token=None):
    monkeypatch.setenv("ENV", env)
    if token is None:
        monkeypatch.delenv("ML_SERVICE_TOKEN", raising=False)
    else:
        monkeypatch.setenv("ML_SERVICE_TOKEN", token)
    import serving.main as main

    return importlib.reload(main)


def test_production_refuses_to_start_without_token(monkeypatch):
    with pytest.raises(RuntimeError, match="ML_SERVICE_TOKEN is required"):
        load_app(monkeypatch, "production")


@pytest.mark.parametrize("bad", ["short", PUBLIC_OLD_DEFAULT, "ChangeThisToARealSecretValue0123456789"])
def test_production_refuses_weak_or_placeholder_tokens(monkeypatch, bad):
    with pytest.raises(RuntimeError, match="at least 32"):
        load_app(monkeypatch, "staging", bad)


def test_old_public_default_token_no_longer_authenticates(monkeypatch):
    main = load_app(monkeypatch, "production", GOOD_TOKEN)
    c = TestClient(main.app)
    url = "/predict/outage/fac_a?voltage_v=395&freq_hz=49.9&dv_dt=-1"
    assert c.get(url).status_code == 401
    assert c.get(url, headers={"X-Service-Token": PUBLIC_OLD_DEFAULT}).status_code == 401
    assert c.get(url, headers={"Authorization": f"Bearer {PUBLIC_OLD_DEFAULT}"}).status_code == 401
    assert c.get(url, headers={"X-Service-Token": GOOD_TOKEN}).status_code == 200
    assert c.get(url, headers={"Authorization": f"Bearer {GOOD_TOKEN}"}).status_code == 200


def test_every_inference_endpoint_requires_the_token(monkeypatch):
    main = load_app(monkeypatch, "production", GOOD_TOKEN)
    c = TestClient(main.app)
    assert c.get("/predict/outage/fac_a?voltage_v=395").status_code == 401
    assert c.post("/baseline/fac_a", json={"factory_id": "fac_a", "hourly_kwh": [1.0] * 200}).status_code == 401
    assert c.post("/schedule/fac_a", json={}).status_code == 401


def test_development_without_token_is_open_but_with_token_is_enforced(monkeypatch):
    main = load_app(monkeypatch, "development")
    assert TestClient(main.app).get("/predict/outage/fac_a?voltage_v=395").status_code == 200
    main = load_app(monkeypatch, "development", GOOD_TOKEN)
    assert TestClient(main.app).get("/predict/outage/fac_a?voltage_v=395").status_code == 401


@pytest.mark.parametrize("query", ["voltage_v=-9999", "voltage_v=1e9", "freq_hz=1e9", "dv_dt=nan", "voltage_v=nan", "voltage_v=inf"])
def test_nonsensical_inputs_are_rejected_not_scored(monkeypatch, query):
    main = load_app(monkeypatch, "production", GOOD_TOKEN)
    c = TestClient(main.app)
    r = c.get(f"/predict/outage/fac_a?{query}", headers={"X-Service-Token": GOOD_TOKEN})
    assert r.status_code == 422, r.text
