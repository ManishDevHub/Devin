import { redirect } from 'next/navigation';
import expres from "express";

export default function Home() {
    redirect('/dashboard');

}