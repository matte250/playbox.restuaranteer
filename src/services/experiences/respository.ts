import { v4 as guid } from "uuid";
import { RepoFunctionResponse, RepoFunctionResponseWithResult, SqlClient } from "../../SqlClient";
import { DbPlace } from "../places/respository";

export interface DbExperience {
    id: string
    at: DbPlace
    when: Date
}

export interface IExperiencesRepo {
    createExperience: (at: string, when: Date, createdBy: string) => Promise<ExperienceCreated>
    editExperience: (id: string, at: string, when: Date) => Promise<ExperienceUpdated | ExperienceNotFound>
    getExperience: (id: string) => Promise<ExperienceFetched | ExperienceNotFound>
    getExperiences: () => Promise<ExperiencesFetched>
}

type ExperienceCreated = RepoFunctionResponse<"experiencecreated">
type ExperienceUpdated = RepoFunctionResponse<"experienceupdated">
type ExperienceFetched = RepoFunctionResponseWithResult<"experiencefetched", DbExperience>
type ExperienceNotFound = RepoFunctionResponse<"experiencenotfound">
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
    editExperience: (id, at, when) => client.useConnection(async connection => {
        var { result } = await connection.query(
            `
            SELECT EXISTS(
                SELECT *
                FROM experiences
                WHERE id = :id)
            `,
            {
                id
            }
        )
        if(result[0] === false)
            return { type: "experiencenotfound"}
        
        await connection.query(`
            UPDATE experiences
            SET
                at = :at,
                \`when\` = :when
            WHERE
                id = :id
            `, {
                id,
                at,
                when
            })
        return { type: "experienceupdated" };
    }),
    getExperience: (id) => client.useConnection(async connection => {
        var { result } = await connection.query(`
            SELECT
                experiences.id,
                experiences.when,
                places.id as placeId,
                places.name as placeName,
                places.googleMapsLink as placeGoogleMapsLink,
                places.createdBy as placeCreatedBy
            FROM 
                experiences
            LEFT JOIN 
                places on experiences.at = places.id
            WHERE 
                experiences.id = :id
            LIMIT 1`, {
                id,
            })
        var possibleExperience = result[0]
        if (possibleExperience == undefined)
            return { type: "experiencenotfound" }

        const mappedObj: DbExperience = {
            id: possibleExperience.id,
            when: possibleExperience.when,
            at: {
                id: possibleExperience.placeId,
                name: possibleExperience.placeName,
                googleMapsLink: possibleExperience.placeGoogleMapsLink,
                createdBy: possibleExperience.placeCreatedBy
            }
        }

        return { type: "experiencefetched", obj: (mappedObj as DbExperience) }
    }),
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