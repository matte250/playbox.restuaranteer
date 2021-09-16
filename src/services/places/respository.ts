import { v4 as guid } from "uuid";
import { RepoFunctionResponse, RepoFunctionResponseWithResult, SqlClient } from "../../SqlClient";

interface DbPlace {
    id: string
    name: string
    createdBy: string
    googleMapsLink?: string
}

export interface IPlacesRepo {
    createPlace: (name: string, by: string, googleMapsLink?: string) => Promise<PlaceCreated>
    editPlace: (id: string, name: string, by: string, googleMapsLink?: string) => Promise<PlaceEdited>
    getPlace: (id: string) => Promise<PlaceFetched | PlaceNotFound>
    getPlaces: () => Promise<PlacesFetched>
}

type PlaceCreated = RepoFunctionResponse<"placecreated">
type PlaceEdited = RepoFunctionResponse<"placeedited">
type PlaceFetched = RepoFunctionResponseWithResult<"placefetched", DbPlace>
type PlaceNotFound = RepoFunctionResponse<"placenotfound">
type PlacesFetched = RepoFunctionResponseWithResult<"placesfetched", DbPlace[]>


export const createPlacesRepository = (client: SqlClient): IPlacesRepo => ({
    createPlace: (name, createdBy, googleMapsLink) => client.useConnection(async connection => {
        await connection.query(`
            INSERT INTO places (id, name, [createdBy], googleMapsLink)
            VALUES(:id,:name,:createdBy,:googleMapsLink)
        `, {
            id: guid(),
            name,
            createdBy,
            googleMapsLink,
        })
        return { type: "placecreated" };
    }),
    editPlace: (id, name, googleMapsLink) => client.useConnection(async connection => {
        await connection.query(`
        UPDATE places
        SET
            name = :name,
            googleMapsLink = :googleMapsLink
        WHERE
            id = :id
        `, {
            id,
            name,
            googleMapsLink,
        })
        return { type: "placeedited" };
    }),
    getPlace: (id) => client.useConnection(async connection => {
        var { result } = await connection.query(`
            SELECT
                id,
                name,
                createdBy,
                googleMapsLink, 
            FROM 
                places
            WHERE 
                id = :id
            LIMIT 1;
            `, {
            id
        });
        var possiblePlace = result[0]
        if (possiblePlace == undefined)
            return { type: "placenotfound" }

        return { type: "placefetched", obj: (possiblePlace as DbPlace) }
    }),
    getPlaces: () =>
        client.useConnection(async connection => {
            var res = await connection.query(`SELECT id, name, createdBy, googleMapsLink FROM places`)
            return { type: "placesfetched", obj: res.result }
    }),
})