import React, { useState } from "react";

const CreateUserForm = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const user = { name, email };

        const res = await fetch("http://localhost:8080/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });

        if (res.ok) {
            const data = await res.json();
            console.log("✅ User created:", data);
            // Reset form
            setName("");
            setEmail("");
        } else {
            console.error("❌ Failed to create user");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name: </label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
                <label>Email: </label>
                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <button type="submit">Create User</button>
        </form>
    );
};

export default CreateUserForm;
