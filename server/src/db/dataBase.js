import mongoose from "mongoose"

export const dbConnection = async() => {
    try {
        const dbConn = await mongoose.connect(process.env.DB_URL)
        console.log(`MongoDB Connected: DB Host: ${dbConn.connection.host}`)
    } catch (error) {
        console.log(`mongoDB connection error`, error)
        process.exit(1)
    }
}