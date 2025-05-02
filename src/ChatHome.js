import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import ChatRoom from './ChatRoom';
import ChatBox from './ChatBox';

const ChatHome = () => {
    const [connection, setConnection] = useState(null);
    const [usermessages, setUserMessages] = useState([]);
    const [userName, setUserName] = useState('');
    const [chatRoom, setChatRoom] = useState('');
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('student');
    const [activeRoom, setActiveRoom] = useState('');

    useEffect(() => {
        if (!connection) return;

        const handleReceiveMessage = (user, message, room) => {
            setUserMessages(prev => {
                const updated = [...prev, { user, message, room }];
                return updated.slice(-5);
            });
        };

        connection.on("ReceiveMessage", handleReceiveMessage);

        return () => {
            connection.off("ReceiveMessage", handleReceiveMessage);
        };
    }, [connection, activeRoom]);

    const joinChatRoom = async (userName, chatRoom) => {
        setLoading(true);
        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5037/chat")
            .configureLogging(LogLevel.Information)
            .build();

        await connection.start();
        await connection.invoke("JoinChatRoom", userName, chatRoom, role);
        setConnection(connection);
        setActiveRoom(`${chatRoom}_general`);
        setLoading(false);
    };

    const sendMessage = async (message) => {
        if (connection) {
            await connection.invoke("SendMessage", activeRoom, userName, message);
        }
    };

    const filteredMessages = usermessages.filter(msg => msg.room === activeRoom);

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            <main className="container flex-grow mx-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-white">Connecting to chat room...</p>
                    </div>
                ) : (
                    connection ? (
                        <>
                            <div className="flex justify-center gap-4 p-4">
                                <button
                                    className={`px-4 py-2 rounded ${activeRoom.endsWith('_general') ? 'bg-blue-500' : 'bg-gray-600'}`}
                                    onClick={() => setActiveRoom(`${chatRoom}_general`)}
                                >
                                    General
                                </button>
                                <button
                                    className={`px-4 py-2 rounded ${activeRoom.endsWith('_announcement') ? 'bg-red-500' : 'bg-gray-600'}`}
                                    onClick={() => setActiveRoom(`${chatRoom}_announcement`)}
                                >
                                    Announcements
                                </button>
                            </div>
                            <ChatRoom usermessages={filteredMessages} />
                            <ChatBox sendMessage={sendMessage} chatRoom={activeRoom} role={role} />
                        </>
                    ) : (
                        <div className="flex items-center justify-center min-h-screen bg-gray-900">
                            <div className="w-full max-w-lg p-8 mx-4 bg-white rounded-lg shadow-lg md:mx-auto">
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    className="block w-full mb-2 p-2 border rounded"
                                />
                                <input
                                    type="text"
                                    placeholder="Enter chat room name"
                                    value={chatRoom}
                                    onChange={(e) => setChatRoom(e.target.value)}
                                    className="block w-full mb-2 p-2 border rounded"
                                />
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="block w-full mb-4 p-2 border rounded"
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </select>
                                <button
                                    onClick={() => joinChatRoom(userName, chatRoom)}
                                    className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                                >
                                    Join Chat Room
                                </button>
                            </div>
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default ChatHome;