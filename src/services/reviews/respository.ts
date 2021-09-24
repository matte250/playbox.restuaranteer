import { v4 as guid } from "uuid";
import { RepoFunctionResponse, RepoFunctionResponseWithResult, SqlClient } from "../../SqlClient";
import { DbExperience } from "../experiences/respository"

export interface DbReview {
    id: string
    experience: DbExperience,
    createdByName: string,
    score: number,
    created: Date,
    mealName: string,
    note: string,
}

export interface IReviewsRepo {
    createReview: (createdBy: string, created: Date, experience: string, score: number, mealName: string, note: string) => Promise<ReviewCreated>
    editReview: (id: string, experience: string, score: number, mealName: string, note: string) => Promise<ReviewUpdated | ReviewNotFound>
    getReview: (id: string) => Promise<ReviewFetched | ReviewNotFound>
    getReviews: () => Promise<ReviewsFetched>
    getReviewsByUser: (userId: string) => Promise<ReviewFetched>
}

type ReviewCreated = RepoFunctionResponse<"reviewcreated">
type ReviewUpdated = RepoFunctionResponse<"reviewupdated">
type ReviewFetched = RepoFunctionResponseWithResult<"reviewfetched", DbReview>
type ReviewNotFound = RepoFunctionResponse<"reviewnotfound">
type ReviewsFetched = RepoFunctionResponseWithResult<"reviewsfetched", DbReview[]>


export const createReviewsRepository = (client: SqlClient): IReviewsRepo => ({
    createReview: (createdBy, created, experience, score, mealName, note) => client.useConnection(async connection => {
        await connection.query(`
            INSERT INTO reviews 
                (id, createdBy, score, created, experience, mealName, note)
            VALUES
            (:id, :createdBy, :score, :created, :experience, :mealName, :note)
        `, {
            id: guid(),
            createdBy,
            score,
            created,
            experience,
            mealName,
            note
        })
        return { type: "reviewcreated" };
    }),
    editReview: (id, experience, score, mealName, note) => client.useConnection(async connection => {
        var { result } = await connection.query(
            `
            SELECT EXISTS(
                SELECT *
                FROM reviews
                WHERE id = :id)
            `,
            {
                id
            }
        )
        if (result[0] === false)
            return { type: "reviewnotfound" }

        await connection.query(`
        UPDATE reviews
        SET
            experience = :experience,
            score = :score,
            mealName = :mealName,
            note = :note,
        WHERE
            id = :id
        `, {
            id,
            experience,
            score,
            mealName,
            note,
        })
        return { type: "reviewupdated" };
    }),
    getReview: (id) => client.useConnection(async connection => {
        var { result } = await connection.query(`
            SELECT
                reviews.id,
                reviews.score,
                reviews.mealName,
                reviews.note,
                experiences.id as experienceId,
                experiences.\`when\` as experienceWhen,
                places.id as atId,
                places.name as atName,
                places.googleMapsLink as atgoogleMapsLink
            FROM 
                reviews
            LEFT JOIN
                experiences ON reviews.experience = experiences.id
            LEFT JOIN
                places ON experiences.at = places.id
            WHERE 
                reviews.id = :id
            LIMIT 1;
            `, {
            id
        });
        var possibleReview = result[0]
        if (possibleReview == undefined)
            return { type: "reviewnotfound" }

        return { type: "reviewfetched", obj: (possibleReview as DbReview) }
    }),
    getReviews: () =>
        client.useConnection(async connection => {
            var res = await connection.query(`
            SELECT
                reviews.id,
                reviews.score,
                reviews.mealName,
                reviews.note,
                users.name as createdByName,
                experiences.id as experienceId,
                experiences.\`when\` as experienceWhen,
                places.id as atId,
                places.name as atName,
                places.googleMapsLink as atgoogleMapsLink
            FROM 
                reviews
            LEFT JOIN
                users ON reviews.createdBy = users.id
            LEFT JOIN
                experiences ON reviews.experience = experiences.id
            LEFT JOIN
                places ON experiences.at = places.id
            `)
            return { type: "reviewsfetched", obj: (res.result as any[]).map(x => ({
                id: x.id,
                score: x.score,
                mealName: x.mealName,
                note: x.note,
                createdByName: x.createdByName,
                experience: {
                    id: x.experienceId,
                    when: x.experienceWhen,
                    at: {
                        id: x.atId,
                        name: x.atName,
                        googleMapsLink: x.atGoogleMapsLink,
                    }
                }
            })) }
        }),
    getReviewsByUser: (userId) =>
        client.useConnection(async connection => {
            var res = await connection.query(`
            SELECT
                reviews.id,
                reviews.score,
                reviews.mealName,
                reveiws.note,
                experiences.id as experienceId,
                experiences.\`when\` as experienceWhen,
                places.id as atId,
                places.name as atName,
                places.googleMapsLink as at.googleMapsLink
            FROM 
                reviews
            LEFT JOIN
                experiences ON reviews.experience = experiences.id
            LEFT JOIN
                places ON experiences.at = places.id
            WHERE 
                reviews.createdBy = :id
            `)
            return { type: "reviewsfetched", obj: res.result }
        }),
})