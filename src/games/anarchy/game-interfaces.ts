import { IBaseGameObjectData } from "src/core/game";
import { Building, Player } from "./";

export interface IGameObjectProperties extends IBaseGameObjectData {
}

export interface IBuildingProperties extends IGameObjectProperties {
    bribed?: boolean;
    buildingEast?: Building;
    buildingNorth?: Building;
    buildingSouth?: Building;
    buildingWest?: Building;
    fire?: number;
    health?: number;
    isHeadquarters?: boolean;
    owner?: Player;
    x?: number;
    y?: number;
}

export interface IFireDepartmentProperties extends IBuildingProperties {
    fireExtinguished?: number;
}

export interface IPoliceDepartmentProperties extends IBuildingProperties {
}

export interface IWarehouseProperties extends IBuildingProperties {
    exposure?: number;
    fireAdded?: number;
}

export interface IWeatherStationProperties extends IBuildingProperties {
}

export interface IForecastProperties {
    controllingPlayer?: Player;
    direction?: string;
    intensity?: number;
}
