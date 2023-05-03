from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField
from wtforms.validators import DataRequired


class ChannelForm(FlaskForm):
    name = StringField("Name", validators=[DataRequired()])