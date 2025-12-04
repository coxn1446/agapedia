# Database Schema Documentation

> **IMPORTANT**: This file MUST be updated whenever ANY database changes are made. Keep it synchronized with the actual database schema.

## Last Updated
2025-01-15

## Overview
Agapedia is a Wikimedia-based knowledge platform powered by MediaWiki. The system uses PostgreSQL for all database needs:
1. **PostgreSQL** - Used by Express for session storage and custom application data
2. **PostgreSQL** - Used by MediaWiki for all wiki content, user accounts, articles, revisions, categories, and related metadata

Wiki data (articles, users, revisions) is stored in MediaWiki's PostgreSQL database. Express uses PostgreSQL for session management. Both can use the same PostgreSQL instance with separate databases, or separate instances.

**Note**: MediaWiki requires PostgreSQL 10.0+ and PHP `pgsql` extension. While PostgreSQL works well for basic wiki functionality, some MediaWiki extensions may have limited PostgreSQL support.

## PostgreSQL Database (Express)

### session
- **Purpose**: Stores Express session data (created automatically by `connect-pg-simple`)
- **Columns**: Managed by `connect-pg-simple` package
- **Last Modified**: 2025-01-15

### Notes
- Express PostgreSQL database is primarily used for session storage
- Custom application tables can be added here for Express-specific features
- MediaWiki session data is stored separately in MediaWiki's MySQL database

---

## PostgreSQL Database (MediaWiki)

### Overview
MediaWiki uses its own comprehensive database schema stored in PostgreSQL. Key tables include:

### user
- **Purpose**: Stores user accounts
- **Key Columns**: `user_id`, `user_name`, `user_email`, `user_password`, `user_registration`
- **Last Modified**: Managed by MediaWiki

### page
- **Purpose**: Stores wiki pages/articles
- **Key Columns**: `page_id`, `page_namespace`, `page_title`, `page_is_redirect`, `page_is_new`
- **Last Modified**: Managed by MediaWiki

### revision
- **Purpose**: Stores page revisions
- **Key Columns**: `rev_id`, `rev_page`, `rev_text_id`, `rev_timestamp`, `rev_user`, `rev_comment`
- **Last Modified**: Managed by MediaWiki

### text
- **Purpose**: Stores actual page content (WikiText)
- **Key Columns**: `old_id`, `old_text`, `old_flags`
- **Last Modified**: Managed by MediaWiki

### user_groups
- **Purpose**: Maps users to groups (e.g., 'sysop' for admins, 'user' for regular users)
- **Key Columns**: `ug_user`, `ug_group`
- **Last Modified**: Managed by MediaWiki

### For Complete Schema
See [MediaWiki Database Schema Documentation](https://www.mediawiki.org/wiki/Manual:Database_layout) for complete table definitions, indexes, and relationships.

---

## Database Architecture Notes

1. **Unified PostgreSQL System**: 
   - PostgreSQL used for both Express sessions and MediaWiki wiki content
   - Can use separate databases on same instance (e.g., `agapedia_sessions` and `agapedia_wiki`)
   - Or use separate PostgreSQL instances for complete isolation

2. **Session Management**:
   - Express sessions stored in PostgreSQL (`session` table in Express database)
   - MediaWiki sessions stored in PostgreSQL (MediaWiki's session tables in wiki database)
   - MediaWiki cookies stored in Express session for API authentication

3. **User Data**:
   - User accounts stored in MediaWiki PostgreSQL database
   - Express accesses user data via MediaWiki Action API
   - No duplicate user storage in Express PostgreSQL database

4. **Article Data**:
   - All articles, revisions, and content stored in MediaWiki PostgreSQL database
   - Express proxies article operations to MediaWiki API
   - No article data stored in Express PostgreSQL database

5. **PostgreSQL Requirements**:
   - PostgreSQL 10.0 or later required for MediaWiki
   - PHP `pgsql` extension must be enabled
   - MediaWiki supports PostgreSQL but it's considered "second-class" compared to MySQL (some extensions may have limited support)

---

## Views

### [view_name]
- **Purpose**: [What this view provides]
- **Base Tables**: [Which tables it queries]
- **Columns**: [List of columns]
- **Last Modified**: YYYY-MM-DD

---

## Functions

### [function_name](parameters)
- **Purpose**: [What this function does]
- **Parameters**:
  - `param_name` (TYPE): [Description]
- **Returns**: [Return type and description]
- **Usage**: [Example usage]
- **Last Modified**: YYYY-MM-DD

---

## Stored Procedures

### [procedure_name](parameters)
- **Purpose**: [What this procedure does]
- **Parameters**:
  - `param_name` (TYPE): [Description]
- **Returns**: [What it returns]
- **Last Modified**: YYYY-MM-DD

---

## Triggers

### [trigger_name]
- **Table**: [Which table]
- **Event**: [INSERT/UPDATE/DELETE]
- **Timing**: [BEFORE/AFTER]
- **Function**: [Which function it calls]
- **Purpose**: [What it accomplishes]
- **Last Modified**: YYYY-MM-DD

---

## Indexes

### [index_name]
- **Table**: [Which table]
- **Columns**: [Which columns] (include DESC if applicable)
- **Type**: [B-tree, Hash, GIN, GiST, etc.]
- **Unique**: [Yes/No] (note if enforced by constraint)
- **Purpose**: [Why this index exists, what queries it optimizes]
- **Last Modified**: YYYY-MM-DD

---

## Constraints

### Foreign Key Constraints
- `constraint_name`: `table.column` → `referenced_table.referenced_column`
  - **On Delete**: [CASCADE/RESTRICT/SET NULL]
  - **On Update**: [CASCADE/RESTRICT/SET NULL]

### Check Constraints
- `constraint_name` on `table.column`: [condition]

### Unique Constraints
- `constraint_name` on `table(columns)`

---

## Relationships Diagram

```
[Table1] --< [Table2]
[Table1] --> [Table3]
```

---

## Migration History

### 2025-01-15 - MediaWiki Integration
- **Description**: Integrated MediaWiki as wiki backend
- **Database Systems**: 
  - PostgreSQL for Express sessions (session table created by connect-pg-simple)
  - MySQL for MediaWiki (all wiki data)
- **Tables Created**: 
  - PostgreSQL: `session` (auto-created by connect-pg-simple)
  - MySQL: All MediaWiki tables (created during MediaWiki installation)
- **Breaking Changes**: None (new integration)
- **Rollback**: N/A

### 2024-01-15 - Initial Schema Setup
- **Description**: Initial database schema setup for Agapedia app shell
- **Tables Created**: None yet (schema to be defined)
- **Tables Modified**: None
- **Columns Added**: None
- **Columns Modified**: None
- **Functions Created**: None
- **Triggers Created**: None
- **Indexes Created**: None
- **Breaking Changes**: None
- **Rollback**: N/A

---

## Notes

### MediaWiki Integration
- Wiki content (articles, users, revisions) is stored in MediaWiki's PostgreSQL database
- Express uses PostgreSQL for session storage (can be same instance, different database)
- User authentication is handled by MediaWiki; Express proxies authentication requests
- MediaWiki manages its own database schema, indexes, and constraints
- PostgreSQL 10.0+ required; PHP `pgsql` extension must be enabled
- See [MediaWiki Manual](https://www.mediawiki.org/wiki/Manual:Database_layout) for complete schema documentation
- See [MediaWiki PostgreSQL Guide](https://www.mediawiki.org/wiki/Manual:PostgreSQL) for PostgreSQL-specific setup

### Express Database
- Session table created automatically by `connect-pg-simple` when sessions are first used
- Custom application tables can be added to PostgreSQL for Express-specific features
- Timestamps stored as TIMESTAMPTZ for timezone awareness

### Authentication
- User accounts managed by MediaWiki (stored in MySQL)
- Password hashing handled by MediaWiki (uses PBKDF2 by default)
- OAuth users (Google, Apple) - to be implemented
- User roles managed via MediaWiki user groups (sysop for admin, user for regular)

---

## Initial Setup SQL

### PostgreSQL (Express)

```sql
-- Session table is created automatically by connect-pg-simple
-- No manual setup required for basic functionality

-- If custom tables are needed for Express features, add them here
-- Example:
-- CREATE TABLE custom_data (
--   id SERIAL PRIMARY KEY,
--   data TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
```

### PostgreSQL (MediaWiki)

MediaWiki database schema is created automatically during MediaWiki installation via the web-based installer. The installer creates all necessary tables, indexes, constraints, and initial data.

**Setup Steps:**
1. Ensure PostgreSQL 10.0+ is installed and running
2. Enable PHP `pgsql` extension (install `php-pgsql` package if needed)
3. Install MediaWiki following [MediaWiki Installation Guide](https://www.mediawiki.org/wiki/Manual:Installing_MediaWiki)
4. Run MediaWiki installer via web browser
5. Select PostgreSQL as the database type during installation
6. Configure PostgreSQL connection (host, port, database name, user, password)
7. MediaWiki creates all tables automatically in the specified PostgreSQL database

**Key MediaWiki Tables** (created automatically):
- `user` - User accounts
- `page` - Wiki pages
- `revision` - Page revisions
- `text` - Page content
- `user_groups` - User group assignments
- `category` - Categories
- `categorylinks` - Category assignments
- And many more (see MediaWiki documentation)

**For Reference**: See [MediaWiki Database Schema](https://www.mediawiki.org/wiki/Manual:Database_layout) for complete table definitions.

