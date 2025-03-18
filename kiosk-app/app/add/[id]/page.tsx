"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/lib/base";
import useAuth from "@/lib/useAuth";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function Add() {
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { token, isLogedIn, userType } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id

    const handleLogin = async (e: React.FormEvent) => {
        if (!isLogedIn || userType !== 'admin') {
            alert('please login as admin to create: ' + id)
        }
        e.preventDefault()
        setLoading(true)

        const formData = { username, password, id, token };

        try {
            setLoading(true)
            const resp = await fetch(API_URL + '/admin/add.php', {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await resp.json();

            if (resp.ok) {
                alert(id + ' Created successfully !');
                router.push('/admin');
                return;
            }

            alert(data.error || 'something went wrong !');

        } catch (error: any) {
            alert(error.error || error.message);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md bg-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Create {id}</CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        Create credentials to create {id}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="bg-gray-700 border-gray-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-gray-700 border-gray-600"
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "create"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}