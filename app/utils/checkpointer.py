from langgraph.checkpoint.sqlite import SqliteSaver

def get_sqlite_checkpointer():
    # Return memory saver or persistent sqlite checkpointer
    return SqliteSaver.from_conn_string(":memory:")
