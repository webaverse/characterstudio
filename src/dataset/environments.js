import ChrisRoomHdr from "assets/textures/christmas_photo_studio_05.hdr"
import ChrisRoomJpg from "assets/textures/christmas_photo_studio_05.jpg"
import CityHdr from "assets/textures/city1.hdr"
import CityJpg from "assets/textures/city1.jpg"
import RoomHdr from "assets/textures/room1.hdr"
import RoomJpg from "assets/textures/room1.jpg"
import StudioHdr from "assets/textures/studio_small_01.hdr"
import StudioJpg from "assets/textures/studio_small_01.jpg"
import AutoshopHdr from "assets/textures/autoshop_01.hdr"
import AutoshopJpg from "assets/textures/autoshop_01.jpg"

export const ENVIRONMENT_DATA = [
  {
    name: "ChrisRoom",
    hdr: ChrisRoomHdr,
    jpg: ChrisRoomJpg,
    azimuth: 40,
    zenith: 60,
    exposure: 1,
  },
  {
    name: "City",
    hdr: CityHdr,
    jpg: CityJpg,
    azimuth: 315,
    zenith: 75,
    exposure: 1.2,
  },
  {
    name: "Room",
    hdr: RoomHdr,
    jpg: RoomJpg,
    azimuth: 220,
    zenith: 60,
    exposure: 2,
  },
  {
    name: "Studio",
    hdr: StudioHdr,
    jpg: StudioJpg,
    azimuth: 180,
    zenith: 65,
    exposure: 0.8,
  },
  {
    name: "Autoshop",
    hdr: AutoshopHdr,
    jpg: AutoshopJpg,
    azimuth: 200,
    zenith: 70,
    exposure: 1.7,
  },
]
