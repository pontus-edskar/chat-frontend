import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiSend } from 'react-icons/fi';

const ChatBox = ({ sendMessage, chatRoom, role }) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (!message.trim()) return;

        const isAnnouncementRoom = chatRoom.endsWith('_announcement');

        if (isAnnouncementRoom && role !== 'teacher') {
            alert('Endast lärare kan skicka meddelanden i announcements-kanalen.');
            return;
        }

        sendMessage(message);
        setMessage('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isAnnouncementRoom = chatRoom.endsWith('_announcement');
    const isStudent = role !== 'teacher';

    return (
        <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600">
            <div className="flex items-end space-x-2">
                <textarea
                    className="w-full p-2 bg-white rounded-2xl resize-none"
                    rows="1"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                        isAnnouncementRoom && isStudent
                            ? 'Only teachers can write'
                            : 'Skriv ett meddelande...'
                    }
                    disabled={isAnnouncementRoom && isStudent}
                />
                <button
                    onClick={handleSend}
                    disabled={isAnnouncementRoom && isStudent}
                    className={`p-2 rounded ${isAnnouncementRoom && isStudent ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <FiSend className="w-5 h-5 text-white" />
                </button>
            </div>
        </div>
    );
};

ChatBox.propTypes = {
    sendMessage: PropTypes.func.isRequired,
    chatRoom: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired
};

export default ChatBox;