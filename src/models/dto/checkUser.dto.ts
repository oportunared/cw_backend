import {
    IsEmail,
    IsDate,
    Length,
    Min,
    Max,
    IsString,
    MinLength,
    IsDefined,
    Matches,
    IsDateString,
    IsNotEmpty,
    MaxLength,
    IsMobilePhone

} from 'class-validator';


class CheckUserDTO {

    @IsEmail()
    email: string;

    @IsMobilePhone('es-CO')
    phone: string;

}

export default CheckUserDTO

