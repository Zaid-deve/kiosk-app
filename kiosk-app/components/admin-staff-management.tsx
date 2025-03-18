'use client';

import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { Delete, DeleteIcon, LoaderCircle, Trash2 } from 'lucide-react';
import { API_URL } from '@/lib/base';
import useAuth from '@/lib/useAuth';
import { useRouter } from 'next/navigation';

interface StaffMember {
    id: string,
    username: string,
    type: string
}

export default function AdminStaff() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token, userType, isLogedIn } = useAuth();
    const [isDeleting, setDeleting] = useState();
    const router = useRouter();

    // Fetch staff data from the API
    useEffect(() => {
        const fetchStaff = async () => {
            if (!isLogedIn) return;
            if (isLogedIn && userType !== 'admin') {
                alert('You need to login as admin!');
                router.push('/admin');
                return;
            }

            try {
                const response = await fetch(API_URL + '/staff/getAll.php', {
                    method: 'post',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ token })
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch staff');
                }
                const data = await response.json();
                setStaff(data.staff || []);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchStaff();
    }, [isLogedIn]);

    // Handle deleting a staff member
    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(API_URL + `/staff/delete.php`, {
                method: 'DELETE',
                body: JSON.stringify({ id, token })
            });

            if (response.ok) {
                // Remove the deleted staff member from the state
                setStaff(staff.filter(staffMember => staffMember.id !== id));
            } else {
                throw new Error('Failed to delete staff member');
            }
        } catch (err: any) {
            alert('Error deleting staff member: ' + err.message);
        }
    };

    if (loading) {
        return <LoaderCircle className='animate-spin h-25 w-25' />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">My Staff</h1>
            {staff.length === 0 ? (
                <p>No staff members available.</p>
            ) : (
                <div className="overflow-x-auto">
                    <Table aria-label="Staff Members" className="min-w-full bg-gray-600 shadow-md rounded-lg overflow-hidden">
                        <TableHeader className="bg-gray-600">
                            <TableRow>
                                <TableCell className="p-4 text-left text-gray-400">Username</TableCell>
                                <TableCell className="p-4 text-left text-gray-400">ID</TableCell>
                                <TableCell className="p-4 text-left text-gray-400">Type</TableCell>
                                <TableCell className="p-4 text-left text-gray-400">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff.map((staffMember) => (
                                <TableRow key={staffMember.id} className="border-t">
                                    <TableCell className="p-4">{staffMember.username}</TableCell>
                                    <TableCell className="p-4">{staffMember.id}</TableCell>
                                    <TableCell className="p-4">{staffMember.type}</TableCell>
                                    <TableCell className="p-4">
                                        <Button
                                            color="error"
                                            onClick={() => handleDelete(staffMember.id)}
                                            disabled={isDeleting}
                                            className="mx-auto bg-transparent border"
                                        >
                                            <Trash2 className='h-5 w-5 text-red-500'/>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
