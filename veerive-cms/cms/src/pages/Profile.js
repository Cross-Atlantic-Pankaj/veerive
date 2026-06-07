import { useContext, useState, useEffect } from "react"
import AuthContext from "../context/AuthContext"
import axios from '../config/axios'

export default function Profile(){
    const [profile, setProfile] = useState(null);
    const { state } = useContext(AuthContext)
    const userId = state.user._id
    useEffect (() => {
        const fetchProfile = async () => {
            try {
              const { data } = await axios.get(`/api/profile/${userId}`, {headers: {'Authorization': sessionStorage.getItem('token')}});
              setProfile(data);
            } catch (error) {
              console.error('Error fetching profile', error);
            }
          };
      
          fetchProfile();
    },[userId])

    if(!state.user) {
        return <p>loading...</p>
    }
    if (!profile) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h2>Profile Page</h2>
            <h2>Welcome {profile.firstName}!</h2>
            <p>
                <span>Name - {profile.firstName} </span>
                <span>{profile.lastName}</span>
            </p>
            <p>Profile Pic</p>
            <p>Bio - {profile.bio}</p>
            <button>Edit</button>
        </div>
    )
}