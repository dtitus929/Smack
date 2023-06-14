from flask.cli import AppGroup
from app.models.db import db, environment, SCHEMA
from app.models import Channel, User, Message, Reaction
from sqlalchemy.sql import text


# Adds a demo user, you can add other users here if you want
def seed_users():
    demo = User(
        username='Demo', email='demo@aa.io', password='password', first_name='Demo', last_name='User', bio='This user account allows visitors to quickly login to the site and access its features.')
    marnie = User(
        username='diane', email='diane@aa.io', password='password', first_name='Diane', last_name='Thompson', avatar='https://ca.slack-edge.com/T03GU501J-U0476TK99LH-61c6e53dbd3d-512', bio='Hello!  I am an account executive for a large financial firm in the DC area.  In my spare time I enjoy baking and spending time with family.')
    bobbie = User(
        username='bobbie', email='bobbie@aa.io', password='password', first_name='Bobbie', last_name='McGee', avatar='https://ca.slack-edge.com/T03GU501J-USQFVK3GT-947b84c598b8-512', bio='My name is Bobbie and I am a tour boat captain in Florida. I also enjoy biking and rock climbing.')

    db.session.add(demo)
    db.session.add(marnie)
    db.session.add(bobbie)
    db.session.commit()
    return (demo, marnie, bobbie)


# Uses a raw SQL query to TRUNCATE or DELETE the users table. SQLAlchemy doesn't
# have a built in function to do this. With postgres in production TRUNCATEFav
# removes all the data from the table, and RESET IDENTITY resets the auto
# incrementing primary key, CASCADE deletes any dependent entities.  With
# sqlite3 in development you need to instead use DELETE to remove all data and
# it will reset the primary keys for you as well.
def undo_users():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;")
    else:
        db.session.execute(text("DELETE FROM users"))

    db.session.commit()


def seed_channels(users):
    demo = users[0]
    marnie = users[1]
    bobbie = users[2]
    channel1 = Channel(
        name='Cooking',
        subject='Share Recipes and Cooking Tips',
        is_private=False,
        is_direct=False,
        owner=bobbie
    )
    channel2 = Channel(
        name='Vacation Destinations',
        subject='Favorite Places to Visit',
        is_private=False,
        is_direct=False,
        owner=marnie
    )
    channel3 = Channel(
        name='Pets',
        subject='Dogs, Cats, Birds, Fish, Reptiles...',
        is_private=False,
        is_direct=False,
        owner=demo
    )

    channel4 = Channel(
        name='',
        subject='',
        is_private=True,
        is_direct=True,
        owner=demo
    )

    db.session.add(channel1)
    db.session.add(channel2)
    db.session.add(channel3)
    db.session.add(channel4)

    channel1.users.append(demo)
    channel1.users.append(marnie)
    channel1.users.append(bobbie)
    channel2.users.append(demo)
    channel2.users.append(marnie)
    channel2.users.append(bobbie)
    channel3.users.append(demo)
    channel3.users.append(marnie)
    channel3.users.append(bobbie)
    channel4.users.append(demo)
    channel4.users.append(bobbie)
    db.session.commit()

    return (channel1, channel2, channel3, channel4)


def undo_channels():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.channels RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM channels")
    db.session.commit()


def seed_messages(users, channels):
    demo = users[0]
    marnie = users[1]
    bobbie = users[2]
    channel1 = channels[0]
    channel2 = channels[1]
    channel3 = channels[2]
    channel4 = channels[3]
    # Seed messages
    msgs = []
    demo_message_1 = Message(
        content='Does anyone know a good healthy substitue for sour cream?', is_pinned=False, users=demo, channels=channel1)
    demo_message_2 = Message(
        content='Try using yogurt instead.', is_pinned=False, users=bobbie, channels=channel1)
    demo_message_3 = Message(
        content='Hi Bobbie, what time are we meeting tonight?', is_pinned=False, users=demo, channels=channel4)
    msgs.append(demo_message_1)
    msgs.append(demo_message_2)
    msgs.append(demo_message_3)

    marnie_message_1 = Message(
        content='Just got back from Alaska.  The trip was fantasic. GO!!!', is_pinned=False, users=marnie, channels=channel2)
    marnie_message_2 = Message(
        content='I took an Alaskan cruise last year.  It was the best trip ever.', is_pinned=False, users=demo, channels=channel2)
    msgs.append(marnie_message_1)
    msgs.append(marnie_message_2)

    bob_message_1 = Message(
        content='My dog has fleas.  Using Seresto flea and tick collar. Any recommendation for other brands that you\'ve used that seem to work?', is_pinned=False, users=bobbie, channels=channel3)
    bob_message_2 = Message(
        content='I use TevraPet Activate II.  Never had any issues.', is_pinned=False, users=marnie, channels=channel3)
    msgs.append(bob_message_1)
    msgs.append(bob_message_2)

    for msg in msgs:
        db.session.add(msg)

    db.session.commit()
    return tuple(msgs)


def undo_messages():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.messages RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM messages")
    db.session.commit()


def seed_reactions(users, messages):
    demo = users[0]
    marnie = users[1]
    bobbie = users[2]
    demo_message_1, demo_message_2, demo_message_3, marnie_message_1, marnie_message_2, bob_message_1, bob_message_2 = messages

    rctions = []
    reaction_marnie_demo_message_2 = Reaction(
        user=marnie, messages=demo_message_2, reaction="👍"
    )
    rctions.append(reaction_marnie_demo_message_2)

    reaction_bobbie_demo_message_2 = Reaction(
        user=bobbie, messages=demo_message_2, reaction="👍"
    )
    rctions.append(reaction_bobbie_demo_message_2)

    reaction_bobbie_marnie_message_2 = Reaction(
        user=bobbie, messages=marnie_message_2, reaction="👍"
    )
    rctions.append(reaction_bobbie_marnie_message_2)

    reaction_demo_bobbie_message_1 = Reaction(
        user=demo, messages=bob_message_1, reaction="👍"
    )
    rctions.append(reaction_demo_bobbie_message_1)

    for rction in rctions:
        db.session.add(rction)

    db.session.commit()


def undo_reactions():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.reactions RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM reactions")
    db.session.commit()


# Creates a seed group to hold our commands
# So we can type `flask seed --help`
seed_commands = AppGroup('seed')


# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    if environment == 'production':
        # Before seeding in production, you want to run the seed undo
        # command, which will  truncate all tables prefixed with
        # the schema name (see comment in users.py undo_users function).
        # Make sure to add all your other model's undo functions below
        undo_reactions()
        undo_messages()
        undo_channels()
        undo_users()

    users = seed_users()
    # Add other seed functions here
    channels = seed_channels(users)
    msgs = seed_messages(users, channels)
    seed_reactions(users, msgs)


# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    # undo_users()

    # Add other undo functions here
    undo_reactions()
    undo_messages()
    undo_channels()
    undo_users()
