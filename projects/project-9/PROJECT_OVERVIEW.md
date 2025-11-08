# Project 9: Discord Bot

## Non-Technical Overview

### What We're Building

A feature-rich Discord bot that responds to commands, manages server roles, moderates content, and provides useful utilities. The bot integrates with Discord's real-time API and can interact with thousands of users simultaneously.

### Why This Project?

Discord servers need automation and management. This project solves:
- Manual server moderation
- Repetitive administrative tasks
- Lack of custom server features
- Community engagement challenges
- Information lookup inefficiencies

### Who Is This For?

- Discord server admins
- Community managers
- Gaming clans/guilds
- Study groups and communities
- Anyone running a Discord server

### Core Features (What Users Can Do)

1. **Command System** - `!help`, `!ping`, `!info`, etc.
2. **Role Management** - Assign/remove roles with reactions
3. **Moderation** - Kick, ban, mute, warn users
4. **Message Filtering** - Auto-delete spam/inappropriate content
5. **Welcome Messages** - Greet new members
6. **Custom Commands** - Server-specific commands
7. **Polls & Voting** - Create polls with reactions
8. **Server Stats** - Member count, activity tracking
9. **Music Playback** (Optional) - Play audio in voice channels
10. **Database Integration** - Store settings per server

### User Experience Flow

```
1. User invites bot to Discord server
2. Bot joins and sends welcome message
3. Admin types: !setup
4. Bot guides through configuration
5. User types: !role add @Member Verified
6. Bot assigns "Verified" role to @Member
7. New user joins server
8. Bot sends automated welcome message
9. User types: !poll "What's for dinner?" "Pizza" "Tacos"
10. Bot creates poll with reaction votes
```

### Success Criteria (How We Know It Works)

- [ ] Bot responds to commands in under 1 second
- [ ] Handles 1000+ servers simultaneously
- [ ] Never crashes (restarts automatically if needed)
- [ ] Commands work with proper permissions
- [ ] Database stores settings reliably
- [ ] Rate limits are respected (no Discord ban)
- [ ] Error messages are helpful
- [ ] Reconnects after network issues
- [ ] Logs all moderation actions
- [ ] Works across multiple servers independently

### Technical Constraints

- Must use discord.py library
- Must handle async operations correctly
- Must respect Discord API rate limits
- Must store per-server configuration
- Must handle disconnections gracefully
- Must validate permissions before actions
- Must log important events
- Must handle concurrent commands

### Similar Products (For Reference)

- MEE6 (popular, feature-rich)
- Dyno (moderation focused)
- Carl-bot (reaction roles)
- Custom bots (specialized)

### Project Scope

**In Scope:**
- Command system with prefix
- Role management (assign, remove, reaction roles)
- Basic moderation (kick, ban, mute, warn)
- Message filtering (bad words, spam)
- Welcome/goodbye messages
- Custom commands (per server)
- Polls with reactions
- Server statistics
- SQLite database for settings
- Error handling and logging
- Permission checks

**Out of Scope:**
- Music playback (complex, external dependencies)
- Web dashboard (separate project)
- Economy system (complex)
- Level/XP system (gamification)
- Advanced analytics
- Multi-language support
- Custom emojis/stickers

### Estimated Complexity

**Complexity Level:** Complex (Async, Event-Driven)

**Reason:**
- **Async programming** (discord.py is fully async)
- Event-driven architecture
- Discord API complexity
- Real-time operations
- Concurrent command handling
- Rate limit management
- State management across servers
- Error recovery (network issues)
- Permission system complexity

**Estimated Constellations:** 9-12

1. **Setup & Bot Basics** - Discord.py setup, bot token, basic connection
2. **Command System** - Command parsing, prefix handling, help command
3. **Event Handling** - on_message, on_member_join, on_reaction_add, etc.
4. **Database Layer** - SQLite for server settings, per-server config
5. **Role Management** - Assign/remove roles, reaction roles
6. **Moderation** - Kick, ban, mute, warn with reason logging
7. **Message Filtering** - Auto-delete spam, bad words, mention spam
8. **Custom Features** - Welcome messages, custom commands, polls
9. **Permission System** - Check user permissions before actions
10. **Error Handling** - Network errors, API errors, graceful recovery
11. **Logging & Monitoring** - Event logs, mod logs, bot status
12. **Testing & Deployment** - Test server, production deployment, uptime

---

## Key Decisions to Make

1. **Discord Library**
   - discord.py (most popular, maintained)
   - discord.py-self (selfbot support)
   - disnake (fork with slash commands)

2. **Command Framework**
   - discord.ext.commands (built-in)
   - Custom parser (more control)
   - Slash commands (modern)

3. **Database**
   - SQLite (simple, file-based)
   - PostgreSQL (scalable)
   - MongoDB (NoSQL)

4. **Async Approach**
   - Full async/await (required)
   - Task management (background tasks)
   - Queue system for commands

5. **Error Recovery**
   - Auto-reconnect (built-in)
   - Command retry logic
   - Graceful degradation

6. **Hosting**
   - 24/7 VPS (recommended)
   - Heroku (easy, free tier)
   - Self-hosted (full control)

---

## Discord Bot Architecture

### Core Components:

1. **Bot Instance**
   ```python
   import discord
   from discord.ext import commands
   
   bot = commands.Bot(command_prefix='!', intents=discord.Intents.all())
   ```

2. **Cogs (Command Groups)**
   - `ModerationCog` - Kick, ban, mute
   - `RolesCog` - Role management
   - `UtilsCog` - Info, stats, help
   - `FunCog` - Polls, games, jokes

3. **Event Listeners**
   - `on_ready()` - Bot started
   - `on_message()` - New message
   - `on_member_join()` - New member
   - `on_reaction_add()` - Reaction added
   - `on_command_error()` - Command failed

4. **Database**
   - Server settings per guild
   - Custom commands
   - Moderation logs
   - User warnings

---

## Essential Commands

### Moderation:
```
!kick @user [reason]           - Kick user from server
!ban @user [reason]            - Ban user from server
!unban user#1234               - Unban user
!mute @user [duration]         - Mute user (remove send messages)
!unmute @user                  - Unmute user
!warn @user [reason]           - Warn user (logged)
!warnings @user                - View user warnings
```

### Role Management:
```
!role add @user RoleName       - Assign role to user
!role remove @user RoleName    - Remove role from user
!role list                     - List all roles
!reactionrole #channel msgID emoji RoleName - Setup reaction role
```

### Utilities:
```
!help [command]                - Show help
!info @user                    - User information
!serverinfo                    - Server information
!ping                          - Bot latency
```

### Custom:
```
!command add name response     - Add custom command
!command remove name           - Remove custom command
!command list                  - List custom commands
```

---

## Async Programming Challenges

### Challenge 1: Concurrent Commands
- **Problem:** Multiple users issue commands simultaneously
- **Solution:** Async handles concurrent execution naturally

### Challenge 2: Long-Running Operations
- **Problem:** Ban/kick operations block bot
- **Solution:** Use `asyncio.create_task()` for background operations

### Challenge 3: Rate Limiting
- **Problem:** Discord API rate limits (429 errors)
- **Solution:** discord.py handles automatically, but watch for bucket exhaustion

### Challenge 4: Database Operations
- **Problem:** Blocking database calls
- **Solution:** Use `aiosqlite` for async database operations

### Example Async Pattern:
```python
@bot.command()
async def kick(ctx, member: discord.Member, *, reason=None):
    try:
        await member.kick(reason=reason)
        await ctx.send(f"{member} has been kicked.")
        await log_moderation_action(ctx.guild.id, 'kick', member.id, reason)
    except discord.Forbidden:
        await ctx.send("I don't have permission to kick this user.")
    except Exception as e:
        await ctx.send(f"Error: {e}")
```

---

## Permission System

### Discord Permission Hierarchy:
1. **Server Owner** - Full control
2. **Administrator** - All permissions
3. **Moderator** - Kick, ban, manage messages
4. **Member** - Basic permissions
5. **Bot Role** - Assigned permissions

### Permission Checks:
```python
@commands.has_permissions(kick_members=True)
@commands.bot_has_permissions(kick_members=True)
async def kick(ctx, member: discord.Member):
    # Command implementation
    pass
```

### Common Permissions:
- `kick_members` - Kick users
- `ban_members` - Ban users
- `manage_messages` - Delete messages
- `manage_roles` - Assign roles
- `manage_channels` - Edit channels
- `administrator` - All permissions

---

## Database Schema

### Server Settings:
```sql
CREATE TABLE servers (
    guild_id INTEGER PRIMARY KEY,
    prefix VARCHAR(10) DEFAULT '!',
    welcome_channel_id INTEGER,
    welcome_message TEXT,
    mod_log_channel_id INTEGER,
    auto_role_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Custom Commands:
```sql
CREATE TABLE custom_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id INTEGER NOT NULL,
    command_name VARCHAR(50) NOT NULL,
    response TEXT NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(guild_id, command_name)
);
```

### Warnings:
```sql
CREATE TABLE warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    moderator_id INTEGER NOT NULL,
    reason TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Rate Limit Handling

### Discord Rate Limits:
- **Global:** 50 requests/second
- **Per-Route:** Varies (e.g., 5 message edits/5 seconds)
- **429 Response:** "Too Many Requests"

### Best Practices:
- Let discord.py handle rate limits (built-in)
- Don't spam API calls in loops
- Use bulk operations when available
- Cache data to reduce API calls

### Monitoring:
```python
@bot.event
async def on_command(ctx):
    print(f"Rate limit bucket: {ctx.command.bucket}")
```

---

## Error Handling

### Common Errors:
1. **Forbidden (403)** - Bot lacks permissions
2. **Not Found (404)** - User/channel doesn't exist
3. **Rate Limited (429)** - Too many requests
4. **Gateway Timeout** - Connection issue

### Error Handler:
```python
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You don't have permission to use this command.")
    elif isinstance(error, commands.BotMissingPermissions):
        await ctx.send("I don't have permission to do that.")
    elif isinstance(error, commands.CommandNotFound):
        pass  # Ignore unknown commands
    else:
        await ctx.send(f"An error occurred: {error}")
```

---

## Success Metrics

After implementation, we should be able to:

- Respond to commands in under 1 second (P95)
- Handle 100 concurrent servers
- Run 24/7 without crashes (99.9% uptime)
- Process 1000+ commands/hour
- Respect all rate limits (zero 429 errors)
- Automatically reconnect after network issues
- Log all moderation actions
- Store settings per server reliably
- Pass all command tests
- Deploy to production with confidence

---

**This overview will be used to generate the initial constellation structure using the Nebula Protocol.**

**IMPORTANT:** This is an ASYNC, REAL-TIME project. Every Star Gate must include:
- Async/await correctness
- Rate limit compliance
- Error recovery testing
- Multi-server testing

**Next Steps:**
1. Initialize Nebula Protocol for this project
2. Generate constellations with emphasis on async patterns
3. Create detailed Star Systems for commands, events, database, permissions
4. Test with multiple Discord servers
5. Record async patterns to Central KG for future real-time projects
6. Load test with concurrent commands
7. Deploy to 24/7 hosting

