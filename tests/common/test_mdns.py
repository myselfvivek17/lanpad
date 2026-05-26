from unittest.mock import MagicMock, patch

from agents.common import mdns


def test_advertise_registers_service():
    fake_zc = MagicMock()
    with patch("agents.common.mdns.Zeroconf", return_value=fake_zc):
        handle = mdns.advertise(
            hostname="laptop",
            port=8765,
            agent_kind="laptop",
        )
    # registered exactly one service
    assert fake_zc.register_service.call_count == 1
    info = fake_zc.register_service.call_args.args[0]
    assert info.type == "_phone-remote._tcp.local."
    assert b"kind" in info.properties or "kind" in {k.decode() if isinstance(k, bytes) else k for k in info.properties}
    # close releases zeroconf
    handle.close()
    fake_zc.unregister_service.assert_called_once_with(info)
    fake_zc.close.assert_called_once()
