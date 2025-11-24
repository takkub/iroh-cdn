import { Controller, Request, Post, UseGuards, Body, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() req) {
        console.log('Login Request Body:', JSON.stringify(req, null, 2));
        if (!req || !req.email || !req.password) {
            console.error('Invalid login request:', req);
            throw new UnauthorizedException('Invalid login credentials');
        }
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return this.authService.login(user);
    }

    @Post('register')
    async register(@Body() req) {
        console.log('Register Request Body:', JSON.stringify(req, null, 2));
        return this.authService.register(req);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }
}
