// In-memory data structures
const users = {
    alice: {
        name: 'Alice Johnson',
        followers: [],
        following: [],
        posts: []
    },
    bob: {
        name: 'Bob Smith',
        followers: [],
        following: [],
        posts: []
    },
    charlie: {
        name: 'Charlie Brown',
        followers: [],
        following: [],
        posts: []
    },
    diana: {
        name: 'Diana Prince',
        followers: [],
        following: [],
        posts: []
    }
};

let posts = [];
let currentUser = 'alice';
let postIdCounter = 1;

// Initialize with some sample data
function initializeSampleData() {
    // Sample posts
    posts.push({
        id: postIdCounter++,
        author: 'bob',
        content: 'Just launched my new project! Excited to share it with everyone. 🚀',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: ['alice', 'charlie'],
        comments: [{
            author: 'alice',
            text: 'Congratulations! Looks amazing!',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        }]
    });

    posts.push({
        id: postIdCounter++,
        author: 'charlie',
        content: 'Beautiful sunset today! Nature never fails to amaze me. 🌅',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: ['bob', 'diana'],
        comments: []
    });

    posts.push({
        id: postIdCounter++,
        author: 'diana',
        content: 'Learning JavaScript has been such an incredible journey. The possibilities are endless! 💻✨',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: ['alice'],
        comments: [{
            author: 'bob',
            text: 'Keep it up! JavaScript is amazing!',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
        }, {
            author: 'alice',
            text: 'I totally agree! What are you building?',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }]
    });

    // Sample follows
    users.alice.following = ['bob', 'diana'];
    users.bob.followers = ['alice'];
    users.diana.followers = ['alice'];
    users.bob.following = ['charlie'];
    users.charlie.followers = ['bob'];
}

// Utility functions
function getTimeAgo(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function getUserAvatar(username) {
    return username.charAt(0).toUpperCase();
}

function updateUserStats() {
    const user = users[currentUser];
    document.getElementById('postsCount').textContent = posts.filter(p => p.author === currentUser).length;
    document.getElementById('followingCount').textContent = user.following.length;
    document.getElementById('followersCount').textContent = user.followers.length;
}

function updateCurrentUserProfile() {
    const user = users[currentUser];
    document.getElementById('currentUserAvatar').textContent = getUserAvatar(currentUser);
    document.getElementById('currentUserName').textContent = user.name;
    updateUserStats();
}

function switchUser(username) {
    currentUser = username;

    // Update active button
    document.querySelectorAll('.user-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.user === username);
    });

    updateCurrentUserProfile();
    renderSuggestedUsers();
    renderFeed();
}

function renderSuggestedUsers() {
    const suggestedContainer = document.getElementById('suggestedUsers');
    const currentUserFollowing = users[currentUser].following;

    let html = '<h3 style="margin-bottom: 15px; color: #333;">Suggested Users</h3>';

    Object.keys(users).forEach(username => {
        if (username !== currentUser) {
            const user = users[username];
            const isFollowing = currentUserFollowing.includes(username);

            html += `
                <div class="profile-card" style="margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.5); border-radius: 10px;">
                    <div class="profile-avatar" style="width: 50px; height: 50px; font-size: 1.2rem; margin: 0 auto 8px;">
                        ${getUserAvatar(username)}
                    </div>
                    <div class="profile-name" style="font-size: 1rem; margin-bottom: 8px;">${user.name}</div>
                    <button class="follow-btn ${isFollowing ? 'following' : ''}" 
                            onclick="toggleFollow('${username}')"
                            style="font-size: 0.8rem; padding: 6px 12px;">
                        ${isFollowing ? 'Following' : 'Follow'}
                    </button>
                </div>
            `;
        }
    });

    suggestedContainer.innerHTML = html;
}

function toggleFollow(username) {
    const currentUserData = users[currentUser];
    const targetUserData = users[username];

    if (currentUserData.following.includes(username)) {
        // Unfollow
        currentUserData.following = currentUserData.following.filter(u => u !== username);
        targetUserData.followers = targetUserData.followers.filter(u => u !== currentUser);
    } else {
        // Follow
        currentUserData.following.push(username);
        targetUserData.followers.push(currentUser);
    }

    updateUserStats();
    renderSuggestedUsers();
}

function createPost() {
    const content = document.getElementById('postContent').value.trim();
    if (!content) return;

    const newPost = {
        id: postIdCounter++,
        author: currentUser,
        content: content,
        timestamp: new Date(),
        likes: [],
        comments: []
    };

    posts.unshift(newPost);
    document.getElementById('postContent').value = '';
    document.getElementById('charCount').textContent = '0';

    updateUserStats();
    renderFeed();

    // Add animation to the create post area
    document.querySelector('.create-post').classList.add('pulse');
    setTimeout(() => {
        document.querySelector('.create-post').classList.remove('pulse');
    }, 500);
}

function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.likes.includes(currentUser)) {
        post.likes = post.likes.filter(u => u !== currentUser);
    } else {
        post.likes.push(currentUser);
    }

    renderFeed();
}

function addComment(postId) {
    const input = document.querySelector(`#comment-input-${postId}`);
    const content = input.value.trim();
    if (!content) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    post.comments.push({
        author: currentUser,
        text: content,
        timestamp: new Date()
    });

    input.value = '';
    renderFeed();
}

function renderFeed() {
    const feedContainer = document.getElementById('feedContainer');

    if (posts.length === 0) {
        feedContainer.innerHTML = '<div style="text-align: center; color: #666; padding: 40px;">No posts yet. Be the first to share something!</div>';
        return;
    }

    const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);

    const html = sortedPosts.map(post => {
                const author = users[post.author];
                const isLiked = post.likes.includes(currentUser);

                const commentsHtml = post.comments.map(comment => `
            <div class="comment">
                <div class="comment-author">${users[comment.author].name}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');

                return `
            <div class="post fade-in">
                <div class="post-header">
                    <div class="post-avatar">${getUserAvatar(post.author)}</div>
                    <div class="post-info">
                        <div class="post-author">${author.name}</div>
                        <div class="post-time">${getTimeAgo(post.timestamp)}</div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-interactions">
                    <button class="interaction-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                        ${isLiked ? '❤️' : '🤍'} ${post.likes.length} ${post.likes.length === 1 ? 'like' : 'likes'}
                    </button>
                    <button class="interaction-btn">
                        💬 ${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}
                    </button>
                </div>
                ${post.comments.length > 0 || true ? `
                    <div class="comments-section">
                        ${commentsHtml}
                        <div class="comment-input">
                            <input type="text" id="comment-input-${post.id}" placeholder="Write a comment..." 
                                   onkeypress="if(event.key==='Enter') addComment(${post.id})">
                            <button class="comment-btn" onclick="addComment(${post.id})">Post</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');

    feedContainer.innerHTML = html;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize sample data
    initializeSampleData();
    
    // Set up user switching
    document.querySelectorAll('.user-btn').forEach(btn => {
        btn.addEventListener('click', () => switchUser(btn.dataset.user));
    });

    // Set up post creation
    document.getElementById('createPostBtn').addEventListener('click', createPost);
    
    // Character counter
    document.getElementById('postContent').addEventListener('input', function() {
        const count = this.value.length;
        document.getElementById('charCount').textContent = count;
        document.getElementById('createPostBtn').disabled = count === 0 || count > 280;
    });

    // Enter key for post creation
    document.getElementById('postContent').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) {
            createPost();
        }
    });

    // Initialize the interface
    updateCurrentUserProfile();
    renderSuggestedUsers();
    renderFeed();
});