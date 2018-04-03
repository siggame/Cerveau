import { Building, Player } from "./";

export interface IGameObjectProperties {
}

export interface IBuildingProperties {
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

export interface IFireDepartmentProperties {
    fireExtinguished?: number;
}

export interface IPoliceDepartmentProperties {
}

export interface IWarehouseProperties {
    exposure?: number;
    fireAdded?: number;
}

export interface IWeatherStationProperties {
}

export interface IForecastProperties {
    controllingPlayer?: Player;
    direction?: string;
    intensity?: number;
}
