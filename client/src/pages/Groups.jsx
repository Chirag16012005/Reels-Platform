import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [memberEmail, setMemberEmail] = useState("");
  const [error, setError] = useState("");
  const [viewMembersGroup, setViewMembersGroup] = useState(null);
  const [members, setMembers] = useState([]);

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
      fetchGroups();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    }
  };

  // view members
  const handleViewMembers = async (group) => {
    try {
      const res = await api.get(`/groups/${group._id}`);
      setMembers(res.data.members || []);
      setViewMembersGroup(group);
    } catch (err) {
      alert("Failed to load members");
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

          <div style={styles.buttonGroup}>
            <button onClick={() => handleViewMembers(group)}>
              View Members
            </button>
            <button onClick={() => setSelectedGroup(group)}>
              Add Member
            </button>
          </div>
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

      {/* VIEW MEMBERS */}
      {viewMembersGroup && (
        <div style={styles.membersBox}>
          <h4>Members of: {viewMembersGroup.name}</h4>
          
          {members.length === 0 ? (
            <p>No members found</p>
          ) : (
            <ul style={styles.membersList}>
              {members.map((member) => (
                <li key={member._id} style={styles.memberItem}>
                  <strong>{member.username}</strong>
                  <span style={styles.memberEmail}>{member.email}</span>
                </li>
              ))}
            </ul>
          )}

          <button onClick={() => setViewMembersGroup(null)}>Close</button>
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
    alignItems: "center",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  buttonGroup: {
    display: "flex",
    gap: "8px",
  },
  addMemberBox: {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  },
  membersBox: {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #007bff",
    borderRadius: "6px",
    backgroundColor: "#f8f9fa",
  },
  membersList: {
    listStyle: "none",
    padding: 0,
    margin: "10px 0",
  },
  memberItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    marginBottom: "8px",
    backgroundColor: "white",
    border: "1px solid #ddd",
    borderRadius: "4px",
  },
  memberEmail: {
    color: "#666",
    fontSize: "14px",
  },
};

export default Groups;
