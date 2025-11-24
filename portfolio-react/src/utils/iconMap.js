import {
  FaWallet,
  FaCoins,
  FaMoneyBill,
  FaGem,
  FaPhone,
  FaMapMarkerAlt,
  FaEnvelope,
  FaGlobeEurope,
} from "react-icons/fa";

export const serviceIconMap = {
  wallet: FaWallet,
  coins: FaCoins,
  money: FaMoneyBill,
  gem: FaGem,
};

export const contactIconMap = {
  phone: FaPhone,
  location: FaMapMarkerAlt,
  email: FaEnvelope,
  website: FaGlobeEurope,
};

export const getIconComponent = (map, key, fallback) => {
  if (key && map[key]) {
    return map[key];
  }
  if (fallback && map[fallback]) {
    return map[fallback];
  }
  const values = Object.values(map);
  return values.length ? values[0] : null;
};
