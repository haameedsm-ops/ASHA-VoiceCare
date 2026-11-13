"""
Tests for GnaniPrismaClient and provider layer.

NOTE: These tests verify the SIMULATED path only.
Live Gnani Prisma v3.0 tests require GNANI_API_KEY and GNANI_ACCESS_TOKEN credentials.
Tests that require live credentials are marked with:
    # Requires Gnani credentials to test live path
"""
import pytest
from app.services.gnani_prisma import GnaniPrismaClient
from app.services.stt_provider import SimulatedSTTProvider, GnaniPrismaLiveSTTProvider


@pytest.mark.asyncio
async def test_gnani_prisma_client_initialization():
    """GnaniPrismaClient exposes required status fields and defaults to simulated mode
    when no credentials are present in environment."""
    client = GnaniPrismaClient()
    status = client.get_status()
    assert status["service"] == "Gnani Prisma v3.0 STT"
    assert status["sample_rate"] == 16000
    assert "hi-IN" in status["configured_languages"]
    assert "kn-IN" in status["configured_languages"]
    # Without credentials the client must run in simulated (not live) mode
    assert status.get("mode") in ("SIMULATED", "LIVE_DISABLED")
    assert status.get("is_live") is False


@pytest.mark.asyncio
async def test_gnani_prisma_streaming_cycle_no_input():
    """
    Without live STT credentials or a manual transcript,
    finish_stream() must return WAITING_FOR_SPEECH with an empty transcript.
    It must NEVER fabricate a transcript or fake visit data.
    """
    client = GnaniPrismaClient()
    await client.start_stream(language_code="hi-IN", beneficiary_id="BEN-TEST")

    dummy_chunk = b"\x00\x00" * 320
    await client.send_audio_chunk(dummy_chunk)

    result = await client.finish_stream()
    assert result["is_final"] is True
    assert result["transcript"] == "", (
        "Transcript must be empty when no live STT is connected and no manual input was provided. "
        f"Got: {result['transcript']!r}"
    )
    assert result["provider_status"] == "WAITING_FOR_SPEECH", (
        f"Expected WAITING_FOR_SPEECH, got {result['provider_status']!r}"
    )
    assert result.get("is_simulated") is True


@pytest.mark.asyncio
async def test_gnani_prisma_streaming_cycle_manual_input():
    """
    When a manual test transcript is provided via set_manual_transcript(),
    finish_stream() returns it with provider_status=MANUAL_TEST_INPUT.
    The returned transcript must exactly match the input.
    """
    client = GnaniPrismaClient()
    await client.start_stream(language_code="hi-IN", beneficiary_id="BEN-TEST")

    test_note = (
        "Today I visited beneficiary 105. Baby weight is 2.9 kilograms. "
        "Vaccinations due are BCG and OPV zero. Next visit on 20 December."
    )
    client.set_manual_transcript(test_note)

    result = await client.finish_stream()
    assert result["is_final"] is True
    assert result["transcript"] == test_note, (
        f"Transcript mismatch. Expected exact test note, got: {result['transcript']!r}"
    )
    assert result["provider_status"] == "MANUAL_TEST_INPUT"
    assert result["provider"] == "MANUAL TEST INPUT"
    assert result.get("is_simulated") is True


@pytest.mark.asyncio
async def test_gnani_prisma_manual_transcript_consumed_once():
    """
    Manual transcript is consumed on first finish_stream() call.
    A second call without a new manual transcript must return WAITING_FOR_SPEECH.
    """
    client = GnaniPrismaClient()
    await client.start_stream()
    client.set_manual_transcript("One-shot test note for beneficiary 109.")

    first = await client.finish_stream()
    assert first["provider_status"] == "MANUAL_TEST_INPUT"

    # Second finish without setting a new transcript
    await client.start_stream()
    second = await client.finish_stream()
    assert second["transcript"] == ""
    assert second["provider_status"] == "WAITING_FOR_SPEECH"


def test_gnani_prisma_live_provider_unconfigured_status():
    """
    GnaniPrismaLiveSTTProvider without credentials must report is_configured=False
    and status=PROVIDER_UNAVAILABLE.
    # Requires Gnani credentials to test live path
    """
    provider = GnaniPrismaLiveSTTProvider(api_key="", access_token="", endpoint_url="")
    status = provider.get_status()
    assert status["is_configured"] is False
    assert status["status"] == "PROVIDER_UNAVAILABLE"
    assert status["is_live"] is False


@pytest.mark.asyncio
async def test_gnani_prisma_live_provider_start_raises_without_credentials():
    """
    GnaniPrismaLiveSTTProvider.start_stream() must raise RuntimeError when
    credentials are missing, never silently returning fake data.
    # Requires Gnani credentials to test live path
    """
    provider = GnaniPrismaLiveSTTProvider(api_key="", access_token="")
    with pytest.raises(RuntimeError, match="GNANI_API_KEY"):
        await provider.start_stream()


def test_gnani_prisma_client_selects_simulated_provider_without_credentials():
    """GnaniPrismaClient must select SimulatedSTTProvider when no credentials are set."""
    client = GnaniPrismaClient(api_key="", access_token="")
    assert isinstance(client._provider, SimulatedSTTProvider), (
        f"Expected SimulatedSTTProvider, got {type(client._provider).__name__}"
    )
