import { User } from "./user-model";
import { UserLocation } from "../location/user-location-model";


export const addUserLocation = (user: User, userLocation: UserLocation): User => {
  const currentLocations = user.userLocations ?? [];
  return { ...user, userLocations: [...currentLocations, userLocation] };
};

export const updateUserLocation = (user: User, userLocation: UserLocation): User => {
  const currentLocations = user.userLocations ?? [];
  const updatedLocations = currentLocations.map((location) =>
    location.locationId === userLocation.locationId ? userLocation : location
  );

  return { ...user, userLocations: updatedLocations };
};

export const removeUserLocation = (user: User, locationId: string): User => {
  const currentLocations = user.userLocations ?? [];
  return {
    ...user,
    userLocations: currentLocations.filter((location: UserLocation) => location.locationId !== locationId),
  };
};


export const updateUserLocations = (user: User, userLocations: UserLocation[]): User => {
  return { ...user, userLocations };
};
