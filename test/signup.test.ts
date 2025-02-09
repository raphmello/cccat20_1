import axios from "axios";

test.each([
    "97456321558",
    "Rapha-123",
    "Raphael"
])("Should not sign up when name is %s", async function (name: string) {
    await axios.post("http://localhost:3001/signup", {name: name})
        .catch(function (error) {
            console.log("catch")
            return error.response
        })
        .then(function (response) {
            console.log("then")
            expect(response.status).toBe(422);
            expect(response.data.message).toBe(-3);
        })
});

test.each([
    "email",
    "email.com",
    "email@"
])("Should not sign up when email is %s", async function (email: string) {
    await axios.post("http://localhost:3001/signup", {name: "Raphael de Mello", email: email})
        .catch(function (error) {
            return error.response
        })
        .then(function (response) {
            expect(response.status).toBe(422);
            expect(response.data.message).toBe(-2);
        })
});

test.each([
    "",
    "asD123",
    "12345678",
    "asdfghjkl",
    "ASDFGHJKL",
    "asddfg123456"
])("Should not sign up when password is %s", async function (password: string) {
    await axios.post("http://localhost:3001/signup", {
        name: "Raphael de Mello",
        email: "email@email",
        password: password
    })
        .catch(function (error) {
            return error.response
        })
        .then(function (response) {
            expect(response.status).toBe(422);
            expect(response.data.message).toBe(-5);
        })
});

test.each([
    "974563215588",
    "714287",
    "974.563.215-48",
    "714.287.938-10",
    "11111111111"
])("Should not sign up when cpf is %s", async function (cpf: string) {
    await axios.post("http://localhost:3001/signup", {
        name: "Raphael Mello",
        email: `${crypto.randomUUID()}@email.com`,
        password: "Raph1234",
        isDriver: true,
        isPassenger: true,
        cpf: cpf,
        carPlate: "AB11234"
    })
        .catch(function (error) {
            return error.response
        })
        .then(function (response) {
            expect(response.status).toBe(422);
            expect(response.data.message).toBe(-1);
        })
});

test.each([
    "AB11234",
    "",
    "ABCDEFG"
])("Should not sign up when carPlate is %s", async function (carPlate: string) {
    await axios.post("http://localhost:3001/signup", {
        name: "Raphael Mello",
        email: `${crypto.randomUUID()}@email.com`,
        password: "Raph1234",
        isDriver: true,
        isPassenger: true,
        cpf: "37555503859",
        carPlate: carPlate
    })
        .catch(function (error) {
            return error.response
        })
        .then(function (response) {
            expect(response.status).toBe(422);
            expect(response.data.message).toBe(-6);
        })
});

test("Should sign up as driver", async function () {
    await axios.post("http://localhost:3001/signup", {
        name: "Raphael Mello",
        email: `${crypto.randomUUID()}@email.com`,
        password: "Raph1234",
        isDriver: true,
        isPassenger: true,
        cpf: "37555503859",
        carPlate: "ABC1234"
    })
        .catch(function (error) {
            fail(error)
        })
        .then(function (response) {
            expect(response.status).toBe(200);
            expect(response.data.accountId).toBeDefined();
        })
});

test("Should return status 500 when unexpected error", async function () {
    await axios.post("http://localhost:3001/signup", {
        name: "Raphael Mello",
        password: "Raph1234",
        isDriver: true,
        isPassenger: true,
        cpf: "37555503859",
        carPlate: "ABC1234"
    })
        .catch(function (error) {
            return error.response
        })
        .then(function (response) {
            expect(response.status).toBe(500);
            expect(response.data.message).toBe("Internal server error");
        })
});