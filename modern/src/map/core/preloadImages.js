import palette from "../../common/theme/palette";
import { loadImage, prepareIcon } from "./mapUtil";

import directionSvg from "../../resources/images/direction.svg";
import backgroundSvg from "../../resources/images/background.svg";
import noBackgroundSvg from "../../resources/images/noBackground.svg";
import animalSvg from "../../resources/images/icon/animal.svg";
import bicycleSvg from "../../resources/images/icon/bicycle.svg";
import boatSvg from "../../resources/images/icon/boat.svg";
import busSvg from "../../resources/images/icon/bus.svg";
import carSvg from "../../resources/images/icon/car.svg";
import craneSvg from "../../resources/images/icon/crane.svg";
import defaultSvg from "../../resources/images/icon/default.svg";
import helicopterSvg from "../../resources/images/icon/helicopter.svg";
import motorcycleSvg from "../../resources/images/icon/motorcycle.svg";
import offroadSvg from "../../resources/images/icon/offroad.svg";
import personSvg from "../../resources/images/icon/person.svg";
import pickupSvg from "../../resources/images/icon/pickup.svg";
import planeSvg from "../../resources/images/icon/plane.svg";
import scooterSvg from "../../resources/images/icon/scooter.svg";
import shipSvg from "../../resources/images/icon/ship.svg";
import tractorSvg from "../../resources/images/icon/tractor.svg";
import trainSvg from "../../resources/images/icon/train.svg";
import tramSvg from "../../resources/images/icon/tram.svg";
import trolleybusSvg from "../../resources/images/icon/trolleybus.svg";
import truckSvg from "../../resources/images/icon/truck.svg";
import vanSvg from "../../resources/images/icon/van.svg";
import trashPositiveSvg from "../../resources/images/icon/trashPositive.svg";
import trashNegativeSvg from "../../resources/images/icon/trashNegative.svg";
import trashWarningSvg from "../../resources/images/icon/trashYellow.svg";
import trashInfoSvg from "../../resources/images/icon/trashBlue.svg";
import cameraSvg from "../../resources/images/icon/camera.svg";
import skidLoaderSvg from "../../resources/images/icon/skidLoader.svg";
import compactorSvg from "../../resources/images/icon/compactor.svg";
import boomTruckSvg from "../../resources/images/icon/boomTruck.svg";
import dumbTruckSvg from "../../resources/images/icon/dumbTruck.svg";
import sweeperSvg from "../../resources/images/icon/sweeper.svg";
import waterTruckSvg from "../../resources/images/icon/waterTruck.svg";
import LowBedTrailerSvg from "../../resources/images/icon/lowBedTrailer.svg";
import hookLifterSvg from "../../resources/images/icon/hookLifter.svg";
import wreckerTruckSvg from "../../resources/images/icon/wreckerTruck.svg";
import pointSvg from "../../resources/images/icon/point.svg"

export const mapIcons = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  crane: craneSvg,
  default: defaultSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  offroad: offroadSvg,
  person: personSvg,
  pickup: pickupSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  ship: shipSvg,
  tractor: tractorSvg,
  train: trainSvg,
  tram: tramSvg,
  trolleybus: trolleybusSvg,
  truck: truckSvg,
  van: vanSvg,
  trashPositive: trashPositiveSvg,
  trashNegative: trashNegativeSvg,
  trashWarning: trashWarningSvg,
  trashInfo: trashInfoSvg,
  camera: cameraSvg,
  skidLoader: skidLoaderSvg,
  compactor: compactorSvg,
  boomTruck: boomTruckSvg,
  dumbTruck: dumbTruckSvg,
  sweeper: sweeperSvg,
  waterTruck: waterTruckSvg,
  lowBedTrailer: LowBedTrailerSvg,
  hookLifter: hookLifterSvg,
  wreckerTruck: wreckerTruckSvg,
  point: pointSvg
};

export const mapIconKey = (category) => (mapIcons.hasOwnProperty(category) ? category : "default");

export const mapImages = {};

export default async () => {
  const background = await loadImage(backgroundSvg);
  const noBackground = await loadImage(noBackgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  await Promise.all(
    Object.keys(mapIcons).map(async (category) => {
      const results = [];
      ["primary", "positive", "negative", "neutral"].forEach((color) => {
        results.push(
          loadImage(mapIcons[category]).then(async (icon) => {
            // Add here any category if you want to be transparent BG
            if (
              category === "trashPositive" ||
              category === "trashNegative" ||
              category === "bin" ||
              category === "trashInfo" ||
              category === "trashWarning"
            ) {
              mapImages[`${category}-${color}`] = prepareIcon(
                noBackground,
                icon,
                "#FFFFFF00",
              );
              return;
            }

            if (category === "point") {
              mapImages[`${category}-${color}`] = prepareIcon(
                noBackground,
                icon,
                palette.colors[color],
              );
              return;
            }

            mapImages[`${category}-${color}`] = prepareIcon(
              background,
              icon,
              palette.colors[color],
            );
          }),
        );
      });
      await Promise.all(results);
    }),
  );
};
