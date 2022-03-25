import { Inject, Injectable, Logger } from "@nestjs/common";
import { sendSms } from "./func/send_sms";
import {User} from '../users/user.model'
import { UsersService } from "src/users/users.service";
import { twiml } from "twilio";
import { create } from "domain";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { TasksService } from "src/tasks/tasks.service";

const MessagingResponse = require('twilio').twiml.MessagingResponse;
let isSubscribed = false;
let nextIsAddress = false
let step = ["address", "city", "country", "postalCode"];
let i = 0;


@Injectable()
export class TwilioServices {
    @Inject(UsersService)
    private readonly userServices : UsersService;
    @Inject(TasksService)
    private readonly tasksServices: TasksService;
    getTwilio(): string {
        return `I'm twilio ! 🐞`;
    }

    sendSms(phoneNbr: string): string {
        return sendSms(phoneNbr);
    }

    async manageMessage(user: User, twiml, req){
        if (req.body.Body.toLowerCase() === "aides") {
            twiml.message(`
            
            - TEMPS : si vous avez besoins d'aides pour passer le temps 
            - PAPIERS : si vous avez besoins d'aides pour de l'aide dans des papiers 
            - JEUX : si vous avez besoins d'aides pour faire des jeux de société 
            - INFORMATIQUE : si vous avez besoins d'aides pour régler des problèmes informatiques 
            - COURSES : si vous avez besoins d'aides pour faire les courses 
            - JARDINAGE : si vous avez besoins d'aides pour du jardinage 
            - MEDECIN : si vous avez besoins d'aides pour être accompagner chez le medecin 
            - TRAVAUX : si vous avez besoins d'aides pour des travaux 
                        `);
        } else if (!user.address || nextIsAddress) {
            if (!nextIsAddress) {
                twiml.message("Avant cela veuillez renseigner votre addresse ?");
                nextIsAddress = !nextIsAddress
            } else {
                switch (step[i]) {
                    case 'address':
                        this.userServices.updateAddress(user.phone, req.body.Body);
                        twiml.message("Merci d'avoir renseigner votre addresse ! Renseigné maintenant le nom de votre ville !");
                        i++;
                        break;
                    case 'city':
                        this.userServices.updateCity(user.phone, req.body.Body);
                        twiml.message("Merci d'avoir renseigner votre ville! Renseigné maintenant le nom de votre Pays !");
                        i++;
                        break;
                    case 'country':
                        this.userServices.updateCountry(user.phone, req.body.Body);
                        twiml.message("Merci d'avoir renseigner votre Pays! Renseigné maintenant le nom de votre code postal !");
                        i++;
                        break;
                    case 'postalCode':
                        this.userServices.updatePostalCode(user.phone, req.body.Body);
                        twiml.message("Merci de votre confiance ! Redemandez moi maintenant ce que vous voulez");
                        nextIsAddress = !nextIsAddress;
                        break;
                }

            }

        }else {

            switch(req.body.Body.toLowerCase()) {
                case 'temps':

                    twiml.message("Yo le rap");
                    break;
                case 'papiers':
                    break;
                case 'jeux':
                    break;
                case 'informatique':
                    break;
                case 'courses':
                    break;
                case 'medecin':
                    break;
                case 'travaux':
                    break;
            }
        }
    }

    async fetchTasks() {
        const tasksList = await this.tasksServices.findAll();
        return tasksList;
    }


    async subscribe(req : any, twiml, res): Promise<CreateUserDto> {
        if (!isSubscribed) {
            twiml.message("C'est vôtre première fois ici. Quel est votre nom ?");
            isSubscribed = !isSubscribed;
        } else {
            const userDto: CreateUserDto = {
                firstName: req.body.Body,
                phone: req.body.From,
                isValidate: false
            };
            twiml.message(`Bienvenu ${userDto.firstName}, et merci de solliciter notre service. Voici une liste de commande que tu peux accomplir`);
            twiml.message(`
            
            - TEMPS : si vous avez besoins d'aides pour passer le temps 
            - PAPIERS : si vous avez besoins d'aides pour de l'aide dans des papiers 
            - JEUX : si vous avez besoins d'aides pour faire des jeux de société 
            - INFORMATIQUE : si vous avez besoins d'aides pour régler des problèmes informatiques 
            - COURSES : si vous avez besoins d'aides pour faire les courses 
            - JARDINAGE : si vous avez besoins d'aides pour du jardinage 
            - MEDECIN : si vous avez besoins d'aides pour être accompagner chez le medecin 
            - TRAVAUX : si vous avez besoins d'aides pour des travaux 
                        `);
            const rep = await this.userServices.create(userDto);
            return userDto;
        }


    }





}