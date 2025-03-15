"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserIcon } from "@heroicons/react/24/outline"; 

type AgentProfile = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  residenceHomeTown: string;
  homeResidence: string;
  permanentAddress: string;
  profileImage: string;
  nextOfKinFullName: string;
  nextOfKinContactDetails: string;
  nextOfKinPhysicleAddres:string;
};

const ProfilePage = () => {
  const [user, setUser] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("/api/agent/profile", { credentials: "include" });
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col items-center text-center">
          {loading ? (
            <Skeleton className="w-24 h-24 rounded-full" />
          ) : (
            <Avatar className="w-32 h-32">
              <AvatarImage src={user?.profileImage || "/default-avatar.png"} alt="Profile" />
              <AvatarFallback>
                {/* Profile Icon in the Avatar */}
                <UserIcon className="w-8 h-8 text-gray-1800" />
              </AvatarFallback>
            </Avatar>
          )}

          <CardTitle className="text-2xl mt-4">
            {loading ? <Skeleton className="h-6 w-32" /> : `${user?.firstName} ${user?.lastName}`}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full mt-2" />
              <Skeleton className="h-6 w-full mt-2" />
            </>
          ) : (
            <>
              <p><strong>Phone:</strong> {user?.phone}</p>
              <p><strong>Home Residence:</strong> {user?.homeResidence}</p>
              <p><strong>Permanent Address:</strong> {user?.permanentAddress}</p>
              <p><strong>Physical Address:</strong>{user?.residenceHomeTown}</p>

              <p><strong>Next of Kin Name:</strong> {user?.nextOfKinFullName}</p>
              <p><strong>Next of Kin Mobile Number:</strong>{user?.nextOfKinContactDetails}</p>
              <p><strong>Next of Kin Physical Address:</strong>{user?.nextOfKinPhysicleAddres}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logout Button */}
      <div className="mt-6 flex justify-center">
        <Button 
         className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            fetch("/api/auth/logout", { method: "POST" });
            router.push("/login");
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
