import supertest from 'supertest';
import chai from 'chai';
import mongoose from 'mongoose';
import connectDB from '../database.js'; 

const expect = chai.expect;
const requester = supertest('http://localhost:8080');

// this variables are used for the adoptions tests
let petId = '';
let userId = '';
let adoptionId = '';

describe('App AdopMe Functional Testing', () => {

    before (async function() {
        try {
            this.timeout(50000);
            
            if (mongoose.connection.readyState === 0) {
                await connectDB();
            }
            
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionNames = collections.map(col => col.name);
            
            if (collectionNames.includes('pets')) {
                await mongoose.connection.db.dropCollection('pets');
            }
            if (collectionNames.includes('users')) {
                await mongoose.connection.db.dropCollection('users');
            }
            if (collectionNames.includes('adoptions')) {
                await mongoose.connection.db.dropCollection('adoptions');
            }            
            await mongoose.connection.close();
        } catch (error) {
            console.error('Error dropping collections:', error);
        }
    });


    describe('A. Mocks Functional Testing - route /api/mocks/',() => {
        

        it('1. route /api/mocks/mockingpets - GET || genetate 100 mocking pets', async () => {
            const {statusCode,_body} = await requester.get('/api/mocks/mockingpets');
            expect(statusCode).to.equal(200);
        })

        it('2. route /api/mocks/mockingusers - GET || genetate 50 mocking users', async () => {
            const {statusCode,_body} = await requester.get('/api/mocks/mockingusers');
            expect(statusCode).to.equal(200);
        })

        it('3. route /api/mocks/generatedata - POST || genetate 100 mocking pets and 50 mocking users', async () => {
            const {statusCode,_body} = await requester.post('/api/mocks/generatedata').send({
                users: 50,
                pets: 100
            });

            expect(statusCode).to.equal(200);
            expect(_body.summary).to.have.property('usersCreated').equal(50);
            expect(_body.summary).to.have.property('petsCreated').equal(100);
        })

    });

    // Mocks Testing End ------------------------------------------------------------------------------------------------------------------------------------
    
    describe('B. Pets Functional Testing - route /api/pets/',() => {

        it('4. route / -  GET || When get all pets with method GET, the response should have the fields statusCode and payload, and thepayload should be an array. ', async () => {
            const {statusCode,_body} = await requester.get('/api/pets');
            expect(statusCode).to.equal(200);
            expect(_body).to.have.property('payload').to.be.an('array');
        })

        
        it('5. route /api/pets - POST || Should create a pet', async () => {
            const {statusCode,ok,_body} = await requester.post('/api/pets').send({
                name: 'Francisco',
                specie: 'Cat',
                birthDate: '2020-01-01'
            });
            expect(_body.payload).to.have.property('_id');
        })

        it('6. route /api/pets - POST || When craate a pet, the adopted property should be false', async () => {
            const {statusCode,_body} = await requester.post('/api/pets').send({
                name: 'Catherine',
                specie: 'Cat',
                birthDate: '2023-01-01'
            });
            expect(statusCode).to.equal(200);
            expect(_body.payload.adopted).to.be.false;
        })

        it('7. route /api/pets - POST || When creaate a pet, without the field name, the status code should be 400', async () => {
            const {statusCode,_body} = await requester.post('/api/pets').send({
                specie: 'Cat',
                birthDate: '2023-01-01'
            });
            expect(statusCode).to.equal(400);
        });

        it('8. route /api/pets - PUT || the PUT method should update correctly a pet adopted', async () => {
            const {statusCode,_body} = await requester.put('/api/pets/6715abbb362fe337dd17e28f').send({
                specie: 'cat'
            });
            expect(statusCode).to.equal(200);
        })

        it('9. route /api/pets - DELTE || The DELETE method should delete a last pet added. Use a post methos to add a pet, and use the new id created for delete this new pet created.', async () => {
            // crate a pet
            const {_body: {payload: { _id }}}= await requester.post('/api/pets').send({    
                name: 'Clod',
                specie: 'Cat',
                birthDate: '2023-01-01'
            })
            // delete new pet
            const {statusCode} = await requester.delete(`/api/pets/${_id}`);
            expect(statusCode).to.equal(200);
        })

        it('10. route /api/pets/withimage - POST || Should create a pet with load image', async () => {
    
                const mokedPet = {
                    name: 'Isodora',
                    specie: 'Cat',
                    birthDate: '2023-01-01',
                    image: './test/gata01.jpeg'
                }

                const result = await requester.post('/api/pets/withimage')
                .field('name',mokedPet.name)
                .field('specie',mokedPet.specie)
                .field('birthDate',mokedPet.birthDate)
                .attach('image',mokedPet.image);

                petId = result._body.payload._id;

                expect(result.statusCode).to.equal(200);
                expect(result._body.payload.image).to.be.ok;  

        });

    })

    // Pets Testing End ------------------------------------------------------------------------------------------------------------------------------------

    describe('C. Avanced testing', () => {

        let cookie;

        beforeEach(function() {
            this.timeout(5000); 
            cookie = {};
        });

        it ('11. register correctly a user ', async () => {
            const {statusCode,_body} = await requester.post('/api/sessions/register').send({
                first_name: "teste",
                last_name: "teste",
                email: "teste@test.com",
                password: "1234567",
                role: "user"
            });

            userId = _body.payload

            expect(statusCode).to.be.equal(200)
        })

        it ('12. Login correctly', async () => {    

            const resultado = await requester.post('/api/sessions/login').send({
                email: 'teste@test.com',
                password: '1234567'
            });

            const cookieResultado = resultado.headers['set-cookie']['0'];
            expect(cookieResultado).to.be.ok;

            cookie = {
                name: cookieResultado.split('=')['0'],
                value: cookieResultado.split('=')['1']
            }
            expect(cookie.name).to.be.ok.and.equal('coderCookie');
            expect(cookie.value).to.be.ok;
        }) 

    });       

    // adoptions test
    describe('D. Adoptions testing', () => {

        it('13. route /api/adoptions - POST || When craate coorect adoption with user and pet manual created in previus tests, return 200', async () => {

            const {statusCode,_body} = await requester.post(`/api/adoptions/${userId}/${petId}`);
            adoptionId = _body.payload._id;
            expect(statusCode).to.be.equal(200);
            expect(_body.status).to.be.equal('success');
            expect(_body.message).to.be.equal('Pet adopted');
        })

        it('14. route /api/adoptions - GET || When get all adoptions with method GET, the response should have the fields statusCode and payload, and thepayload should be an array. ', async () => {
            const {statusCode,_body} = await requester.get('/api/adoptions');
            expect(statusCode).to.equal(200);
            expect(_body.status).to.equal('success');
            expect(_body.payload).to.be.an('array');
        })

        it('15. route /api/adoptions - GET || When get the adoption created in point 13, the response should have the fields statusCode equal 200, payload should be an object', async () => {
            const {statusCode,_body} = await requester.get(`/api/adoptions/${adoptionId}`);
            expect(statusCode).to.equal(200);
            expect(_body.status).to.equal('success');
            expect(_body.payload).to.be.an('object'); 

        })  

        it('16 route /api/adoptions - POST || When intent craate adoption with incorrect parameters return error', async () => {

            const {statusCode,_body} = await requester.post(`/api/adoptions/507f1f77bcf86cd799439011/${petId}`);
            expect(statusCode).to.be.equal(404);
            expect(_body.status).to.be.equal('error');
        })

        it('17. route /api/adoptions - GET || When get the adoption with incorrect id, the response should have error', async () => {
            const {statusCode,_body} = await requester.get(`/api/adoptions/507f1f77bcf86cd799439011`);
            expect(statusCode).to.equal(404);
            expect(_body.status).to.equal('error');
            expect(_body.error).to.be.equal('Adoption not found');
        })  

    }); 

}); 




