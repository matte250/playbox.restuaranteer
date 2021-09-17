import { v4 as guid } from "uuid";
import { RepoFunctionResponse, RepoFunctionResponseWithResult, SqlClient } from "../../SqlClient";
import { DbPlace } from "../places/respository";

interface DbExperience {
    id: string
    at: DbPlace
    when: Date
}

/*
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    at VARCHAR(36) NOT NULL,
    when DATETIME NOT NULL,
    [createdBy] VARCHAR(36) NOT NULL,
    FOREIGN KEY (at) REFERENCES places(id),
    FOREIGN KEY (createdBy) REFERENCES users(id)
*/

export interface IExperiencesRepo {
    createExperience: (at: string, when: Date, createdBy: string) => Promise<ExperienceCreated>
    /*
    editPlace: (id: string, name: string, by: string, googleMapsLink?: string) => Promise<PlaceEdited | PlaceNotFound>
    getPlace: (id: string) => Promise<PlaceFetched | PlaceNotFound>
    */
    getExperiences: () => Promise<ExperiencesFetched>
}

type ExperienceCreated = RepoFunctionResponse<"experiencecreated">
/*
type PlaceEdited = RepoFunctionResponse<"placeedited">
type PlaceFetched = RepoFunctionResponseWithResult<"placefetched", DbPlace>
type PlaceNotFound = RepoFunctionResponse<"placenotfound">
*/
type ExperiencesFetched = RepoFunctionResponseWithResult<"experiencesfetched", DbExperience[]>


export const createExperiencesRepository = (client: SqlClient): IExperiencesRepo => ({
    
    createExperience: (at, when, createdBy) => client.useConnection(async connection => {
        await connection.query(`
            INSERT INTO experiences (id, at, \`when\`, createdBy) VALUES(:id,:at,:when,:createdBy)
        `, {
            id: guid(),
            at,
            when,
            createdBy,
        })
        return { type: "experiencecreated" };
    }),
    /*
    editPlace: (id, name, googleMapsLink) => client.useConnection(async connection => {
        var { result } = await connection.query(
            `
            SELECT EXISTS(
                SELECT *
                FROM places
                WHERE id = :id)
            `,
            {
                id
            }
        )
        if(result[0] === false)
            return { type: "placenotfound"}
        
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
                googleMapsLink
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
    */
    getExperiences: () =>
        client.useConnection(async connection => {
            var res = await connection.query(`
            SELECT
                experiences.id,
                experiences.when,
                places.id as placeId,
                places.name as placeName,
                places.googleMapsLink as placeGoogleMapsLink 
            FROM experiences
            LEFT JOIN places on experiences.at = places.id`)
            return { type: "experiencesfetched", obj: (res.result as Array<any>).map(x => ({
                id: x.id,
                when: x.when,
                at: {
                    id: x.placeId,
                    name: x.placeName,
                    googleMapsLink: x.placeGoogleMapsLink
                }
            }) ) }
    }),
})