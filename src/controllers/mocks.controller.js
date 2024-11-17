import MockingService from "../services/mocks.service.js";
import { petsService, usersService } from "../services/index.js";


const defaultValues = {
    users: 50,
    pets: 100
};

const HTTP_STATUS = {
    OK: 200,
    INTERNAL_SERVER_ERROR: 500
};

const getMockingPets = async (req, res) => {
    try {
        const petsCount = parseInt(req.query.pets) || defaultValues.pets; 
        const mockPets = await MockingService.generateMockingPets(petsCount);
        return res.status(HTTP_STATUS.OK).json({
            status: "success", 
            payload: mockPets
        });
    } catch (error) {
        console.error("Error generating mock pets:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to generate mock pets",
            error: error.message
        });
    }
};

const getMockingUsers = async (req, res) => {
    try {
        const usersCount = parseInt(req.query.users) || defaultValues.users;
        const mockUsers = await MockingService.generateMockingUsers(usersCount);
        return res.status(HTTP_STATUS.OK).json({
            status: "success",
            payload: mockUsers
        });
    } catch (error) {
        console.error("Error generating mock users:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Failed to generate mock users",
            error: error.message
        });
    }
};

const generateData = async (req, res) => {
    const { 
        users = defaultValues.users, 
        pets  =defaultValues.pets 
    } = req.body; 
    try {
        if (!Number.isInteger(users) || !Number.isInteger(pets) || users < 0 || pets < 0) {
            return res.status(400).json({
                status: "error",
                message: "Users and pets counts must be positive integers"
            });
        }

        // Generate mock data
        const [mockingUsers, mockingPets] = await Promise.all([
            MockingService.generateMockingUsers(users),
            MockingService.generateMockingPets(pets)
        ]);

        // Save data to database
        await Promise.all([
            ...mockingUsers.map(user => usersService.create(user)),
            ...mockingPets.map(pet => petsService.create(pet))
        ]);
        
        return res.status(HTTP_STATUS.OK).json({
            status: "success",
            message: "Users and pets created successfully",
            summary: {
                usersCreated: mockingUsers.length,
                petsCreated: mockingPets.length
            }
        });

    } catch (error) {
        console.error("Error generating pets and users data:", error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            status: "error",
            message: "Server error generating pets and users data",
            error: error.message
        });
    }
};


export default {
    getMockingPets,
    getMockingUsers,
    generateData
};