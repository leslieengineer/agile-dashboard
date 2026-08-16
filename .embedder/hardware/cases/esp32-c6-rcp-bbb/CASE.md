---
title: ESP32-C6 RCP not responding on BBB native USB
status: resolved
opened: 2026-08-16
hardware: BeagleBone Black + ESP32-C6
tags: [openthread, rcp, usb, spinel]
---

## Symptom

BBB enumerates the ESP32-C6 as Espressif USB JTAG/serial debug unit `303a:1001` at `/dev/ttyACM0`, but Pyspinel cannot obtain a version response at 460800 or 115200 baud.

## Hypotheses

| Hypothesis | Verdict | Evidence |
|---|---|---|
| BBB does not detect the ESP32-C6 | Rejected | `lsusb` reports 303a:1001 and udev creates `/dev/ttyACM0`. |
| Linux permissions prevent RCP access | Rejected | User `leslie` belongs to `dialout`; Pyspinel opens the device successfully. |
| Baud rate mismatch | Rejected as primary cause | No Spinel response at either 460800 or 115200. |
| Firmware sends Spinel over UART0 rather than native USB | Confirmed and fixed | User initially flashed the default `ot_rcp` example. After rebuilding with `CONFIG_OPENTHREAD_RCP_USB_SERIAL_JTAG=y`, Pyspinel returned the RCP version at 460800 baud. |
| OTBR is already consuming the device | Rejected | `otbr-agent` is inactive/not installed and Pyspinel can open the port. |

## Findings

The original firmware routed Spinel through UART0. The ESP32-C6 was rebuilt with USB Serial/JTAG RCP and now responds on `/dev/ttyACM0` at 460800 with version `openthread-esp32/7101770dc-a98813b30`.

OTBR source is prepared at `/home/leslie/ot-br-posix`. Installation now requires the user to complete the interactive sudo bootstrap.

## Next probe

Resolved. `otbr-agent` was built, installed, enabled and started with the stable by-id USB path; service logs confirm the ESP32-C6 RCP version and successful Border Agent/Backbone Router initialization.
