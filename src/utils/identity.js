import { fetchReticulumAuthenticated } from "./phoenix-utils";
import defaultAvatar from "../assets/models/boy.glb";
const { faker } = require('@faker-js/faker');

const names = [
  "Baers-Pochard",
  "Baikal-Teal",
  "Barrows-Goldeneye",
  "Blue-Billed",
  "Blue-Duck",
  "Blue-Winged",
  "Brown-Teal",
  "Bufflehead",
  "Canvasback",
  "Cape-Shoveler",
  "Chestnut-Teal",
  "Chiloe-Wigeon",
  "Cinnamon-Teal",
  "Comb-Duck",
  "Common-Eider",
  "Common-Goldeneye",
  "Common-Merganser",
  "Common-Pochard",
  "Common-Scoter",
  "Common-Shelduck",
  "Cotton-Pygmy",
  "Crested-Duck",
  "Crested-Shelduck",
  "Eatons-Pintail",
  "Falcated",
  "Ferruginous",
  "Freckled-Duck",
  "Gadwall",
  "Garganey",
  "Greater-Scaup",
  "Green-Pygmy",
  "Grey-Teal",
  "Hardhead",
  "Harlequin",
  "Hartlaubs",
  "Hooded-Merganser",
  "Kelp-Goose",
  "King-Eider",
  "Lake-Duck",
  "Laysan-Duck",
  "Lesser-Scaup",
  "Long-Tailed",
  "Maccoa-Duck",
  "Mallard",
  "Mandarin",
  "Marbled-Teal",
  "Mellers-Duck",
  "Merganser",
  "Northern-Pintail",
  "Orinoco-Goose",
  "Paradise-Shelduck",
  "Plumed-Whistler",
  "Puna-Teal",
  "Pygmy-Goose",
  "Radjah-Shelduck",
  "Red-Billed",
  "Red-Crested",
  "Red-Shoveler",
  "Ring-Necked",
  "Ringed-Teal",
  "Rosy-Billed",
  "Ruddy-Shelduck",
  "Salvadoris-Teal",
  "Scaly-Sided",
  "Shelduck",
  "Shoveler",
  "Silver-Teal",
  "Smew",
  "Spectacled-Eider",
  "Spot-Billed",
  "Spotted-Whistler",
  "Steamerduck",
  "Stellers-Eider",
  "Sunda-Teal",
  "Surf-Scoter",
  "Tufted-Duck",
  "Velvet-Scoter",
  "Wandering-Whistler",
  "Whistling-duck",
  "White-Backed",
  "White-Cheeked",
  "White-Winged",
  "Wigeon",
  "Wood-Duck",
  "Yellow-Billed"
];
const avatarList = [
  'vqnkHx2',
  'GkVC3Zq'
];

function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomAvatar() {
  return chooseRandom(avatarList);
}

export function generateRandomName() {
  return `${chooseRandom(names)}-${Math.floor(10000 + Math.random() * 10000)}`;
}

export function generateRandomUsername() {
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const fullName = `${firstName} ${lastName}`;
  const nickname = faker.internet.username(firstName, lastName);
  return { fullName, nickname };
}

export async function fetchRandomDefaultAvatarId() {
  const defaultAvatarEndpoint = "/api/v1/media/search?filter=default&source=avatar_listings";
  const defaultAvatars = (await fetchReticulumAuthenticated(defaultAvatarEndpoint)).entries || [];
  if (defaultAvatars.length === 0) {
    // If reticulum doesn't return any default avatars, just default to the duck model. This should only happen
    // when running against a fresh reticulum server, e.g. a local ret instance.
    return new URL(defaultAvatar, location.href).href;
  }
  const avatarIds = defaultAvatars.map(avatar => avatar.id);
  return chooseRandom(avatarIds);
}
