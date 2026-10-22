import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await prisma.user.findFirst({ 
            where: {
                OR: [
                    { email: normalizedEmail },
                    { username: username.trim() }
                ]
            }
        });

        if (existingUser) {    
            return res.status(400).json({
                success: false,
                message: existingUser.email === normalizedEmail ? 'Email already registered' : 'Username already taken'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Strict security: all signups are strictly regular users.
        // Only the designated admin email receives admin role.
        const adminEmail = (process.env.ADMIN_EMAIL || 'ramuk13476@gmail.com').toLowerCase().trim();
        const userRole = normalizedEmail === adminEmail ? "admin" : "user";

        const newUser = await prisma.user.create({
            data: {
                username: username.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                role: userRole
            }
        });

        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email, username: newUser.username, role: newUser.role },
            process.env.JWT_SECRET || 'supersecret_careerhub_jwt_key_2026',
            { expiresIn: '7d' }
        );

        return res.status(201).json({ 
            success: true,
            message: 'User created successfully',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("signup error:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, username: user.username, role: user.role || 'user' },
            process.env.JWT_SECRET || 'supersecret_careerhub_jwt_key_2026',
            { expiresIn: '7d' }
        );

        return res.status(200).json({ 
            success: true,
            message: 'Logged in successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            }
        });

    } catch (error) {
        console.error("login error:", error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};