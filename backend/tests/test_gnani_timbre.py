"""
Tests for GnaniTimbreClient and TTS provider layer.

NOTE: These tests verify the SIMULATED path only.
Live Gnani Timbre v3.0 tests require GNANI_API_KEY and GNANI_ACCESS_TOKEN credentials.
Tests that require live credentials are marked with:
    # Requires Gnani credentials to test live path
"""
import pytest
from app.services.gnani_timbre import GnaniTimbreClient
from app.services.tts_provider import SimulatedTTSProvider, GnaniTimbreLiveTTSProvider


def test_gnani_timbre_readback_script_generation():
    client = GnaniTimbreClient()
    script = client.generate_readback_script(
        beneficiary_id="BEN-102",
        visit_type="newborn visit",
        weight=2.8,
        vaccinations_due="BCG, OPV-0",
        next_visit_date="15 December",
        language_code="hi-IN",
    )
    # The script should contain the mandatory fields but not rely on any live API
    assert "beneficiary 102" in script
    assert "newborn visit" in script
    assert "weight 2.8 kilograms" in script
    assert "15 December" in script
    assert "Is this correct?" in script


def test_gnani_timbre_simulated_speech_synthesis():
    client = GnaniTimbreClient()
    import asyncio

    # Call the async method directly
    result = await client.synthesize_speech("Test text", "hi-IN")
    # Using the simulated provider returns a dict with text and no audio bytes
    assert result["text"] == "Test text"
    assert result["audio_content"] is None
    assert result["provider_status"] == "CLIENT_SPEECH_SYNTHESIS"
    assert result["is_simulated"] is True


def test_gnani_timbre_live_provider_unconfigured_status():
    """
    GnaniTimbreLiveTTSProvider without credentials must report is_configured=False
    and status=PROVIDER_UNAVAILABLE.
    # Requires Gnani credentials to test live path
    """
    provider = GnaniTimbreLiveTTSProvider(api_key="", access_token="", endpoint_url="")
    status = provider.get_status()
    assert status["is_configured"] is False
    assert status["status"] == "PROVIDER_UNAVAILABLE"
    assert status["is_live"] is False


@pytest.mark.asyncio
async def test_gnani_timbre_live_provider_synthesize_raises_without_credentials():
    """
    GnaniTimbreLiveTTSProvider.synthesize_speech() must return PROVISION_UNAVAILABLE when no creds.
    # Requires Gnani credentials to test live path
    """
    provider = GnaniTimbreLiveTTSProvider(api_key="", access_token="")
    result = await provider.synthesize_speech("Test", "hi-IN")
    assert result["provider_status"] == "PROVIDER_UNAVAILABLE"
    assert result["audio_content"] is None


def test_gnani_timbre_client_selects_simulated_provider_without_credentials():
    client = GnaniTimbreClient(api_key="", access_token="")
    assert isinstance(client._provider, SimulatedTTSProvider), (
        f"Expected SimulatedTTSProvider, got {type(client._provider).__name__}"
    )
