import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // fetch groups
  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // create group
  const handleCreateGroup = async(e)=>{
    e.preventDefault();

    if (!groupName.trim()) return;

    try 
    {
      await api.post("/groups", {
         name: groupName 
        });
      
      setGroupName("");
      fetchGroups();
    } catch (err) 
    {
      setError(err.response?.data?.message || "Failed to create group");
    }
  };

  // add member
  const handleAddMember = async () => 
    {
    if (!memberEmail || !selectedGroup) 
    return;

    try {
      await api.post("/groups/add-member", {
        groupId: selectedGroup._id,
        email: memberEmail,
      });

      setMemberEmail("");
      alert("Member added");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Your Groups</h2>

      {/* CREATE GROUP */}
      <form onSubmit={handleCreateGroup} style={styles.createBox}>
        <input
          placeholder="New group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* GROUP LIST */}
      {groups.length === 0 && <p>No groups yet</p>}

      {groups.map((group) => (
        <div key={group._id} style={styles.groupCard}>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/group/${group._id}`)}
          >
            {group.name}
          </span>

          <button onClick={() => setSelectedGroup(group)}>
            Add Member
          </button>
        </div>
      ))}

      {/* ADD MEMBER */}
      {selectedGroup && (
        <div style={styles.addMemberBox}>
          <h4>Add member to: {selectedGroup.name}</h4>

          <input
            placeholder="Member email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />

          <div>
            <button onClick={handleAddMember}>Add</button>
            <button onClick={() => setSelectedGroup(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "30px auto",
    padding: "20px",
  },
  createBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  groupCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  addMemberBox: {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
};

export default Groups;
