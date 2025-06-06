import React from "react";

type ProfilePictureProps = {
    profilePicture: string;
};

const ProfilePicture: React.FC<ProfilePictureProps> = ({ profilePicture }) => {
    if (!profilePicture) return null;

    return (
        <div className="text-center mb-3">
            <img
                src={profilePicture}
                alt="Profile"
                style={{ maxWidth: "200px", borderRadius: "50%" }}
            />
        </div>
    );
};

export default ProfilePicture;