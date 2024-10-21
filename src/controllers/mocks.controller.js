import MockingService from "../services/mocks.service.js";
import { petsService, usersService } from "../services/index.js";

const getMockingPets = async (req, res) => {
    try {
        const pets = await MockingService.generateMockingPets(100);
        res.json({status: "success", payload: pets});
    } catch (error) {
        res.status(500).json({status: "error", message: "Error generating mock pets"});
    }
};

const getMockingUsers = async (req, res) => {
    try {
        const users = await MockingService.generateMockingUsers(50);
        res.json({status: "success", payload: users});
    } catch (error) {
        res.status(500).json({status: "error", message: "Error generating mock users"});
    }
};

const generateData = async (req, res) => {
    const { users = 50, pets = 100 } = req.body; 
    try {
        const [mockingUsers, mockingPets] = await Promise.all([
            MockingService.generateMockingUsers(users),
            MockingService.generateMockingPets(pets)
        ]);

        await Promise.all([
            ...mockingUsers.map(user => usersService.create(user)),
            ...mockingPets.map(pet => petsService.create(pet))
        ]);
        
        res.json({
            status: "success",
            message: "Users and Pets created successfully"
        });
    } catch (error) {
        console.error("Error generating pets and users data:", error);
        res.status(500).json({status: "error", message: "Server Error generating pets and users data"}); 
    }
};

export default {
    getMockingPets,
    getMockingUsers,
    generateData
};