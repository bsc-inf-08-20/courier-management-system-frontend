"use client";

import { Button } from "@/components/ui/button";

export default function Customer() {
  return (
    <div>
      <h1>customer</h1>
      <Button onSubmit={() => console.log("hello there")}></Button>
    </div>
  );
}
