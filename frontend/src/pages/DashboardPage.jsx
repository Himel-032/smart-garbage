
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard(){
    const { admin } = useAuth();

    return(
        <div>
            <Navbar />
            <div className="p-4">
                <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard, {admin.name}!</h2>
                {admin && (
                    <div className="bg-white p-4 rounded shadow">
                    <h3 className="text-xl font-semibold mb-2">Admin Details</h3>
                    <p><strong>Name:</strong> {admin.name}</p>
                    </div>)}
            </div>
        </div>
    );
}