import crypto from "crypto";
import pgp from "pg-promise";
import express, {Request} from "express";
import {validateCpf} from "./validateCpf";

const app = express();
app.use(express.json());

function validateRequest(acc: any, input: Request) {
    if (acc) {
        return -4;
    }
    if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/)) {
        return -3;
    }
    if (!input.email.match(/^(.+)@(.+)$/)) {
        return -2;
    }
    if (!input.password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)) {
        return -5
    }
    if (!validateCpf(input.cpf)) {
        return -1;
    }
    if (input.isDriver && !input.carPlate.match(/[A-Z]{3}[0-9]{4}/)) {
        return -6;
    }
}

app.post("/signup", async function (req, res) {
    const input = req.body;
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    try {
        const id = crypto.randomUUID();
        let result;
        const [acc] = await connection.query("select * from ccca.account where email = $1", [input.email]);
        validateRequest(acc, input);
        if (input.isDriver) {
            await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) " +
                "values ($1, $2, $3, $4, $5, $6, $7, $8)",
                [id, input.name, input.email, input.cpf, input.carPlate, input.isPassenger, input.isDriver, input.password]);
            const obj = {
                accountId: id
            };
            result = obj;
        } else {
            await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) " +
                "values ($1, $2, $3, $4, $5, $6, $7, $8)",
                [id, input.name, input.email, input.cpf, input.carPlate, input.isPassenger, input.isDriver, input.password]);
            const obj = {
                accountId: id
            };
            result = obj;
        }
        if (typeof result === "number") {
            res.status(422).json({message: result});
        } else {
            res.json(result);
        }
    } catch
        (e) {
        res.status(500).json({message: "Internal server error"});
    } finally {
        await connection.$pool.end();
    }
})
;

app.get("/accounts/:accountId", async function (req, res) {
    const accountId = req.params.accountId;
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [output] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
    res.json(output);
});

app.listen(3001);
