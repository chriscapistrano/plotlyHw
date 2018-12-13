import os

import pandas as pd
import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template


app = Flask(__name__)

#################################################
# Database Setup
#################################################

engine = create_engine("sqlite:///db/belly_button_biodiversity.sqlite", echo=False)

Base = automap_base()
Base.prepare(engine, reflect=True)
Sample = Base.classes.samples
OTU = Base.classes.otu
Metadata = Base.classes.samples_metadata


session = Session(engine)

# create route that renders index.html template
@app.route("/")
def index():
    return render_template("index.html")

@app.route('/names')
def names():
    stmt = session.query(Sample).statement
    df = pd.read_sql_query(stmt, session.bind)
    df.set_index('otu_id', inplace=True)
    return jsonify(list(df.columns))

@app.route('/otu')
def otu():
    otu = session.query(OTU).statement
    otu_df = pd.read_sql_query(otu, session.bind)
    otu_df.set_index('otu_id', inplace=True)
    return jsonify(list(otu_df))

@app.route('/metadata/<sample>')
def metadata(sample):
    all_samples_metadata = session.query(Metadata).statement
    all_samples_metadata_df = pd.read_sql_query(all_samples_metadata, session.bind)
    sample_num = int(sample.split("_")[1])
    selected_sample = all_samples_metadata_df.loc[all_samples_metadata_df["SAMPLEID"] == sample_num, :]
    json_selected_sample = selected_sample.to_json(orient='records')
    return json_selected_sample

@app.route('/samples/<sample>')
def samples(sample):
    all_otus = session.query(OTU).statement
    all_otus_df = pd.read_sql_query(all_otus, session.bind)
    all_otus_df.set_index('otu_id', inplace=True)

    all_samples = session.query(Sample).statement
    all_samples_df = pd.read_sql_query(all_samples, session.bind)
    selected_sample = all_samples_df[sample]
    otu_ids = all_samples_df['otu_id']
    selection_df = pd.DataFrame({
        "otu_ids":otu_ids,
        "samples":selected_sample
    })
    sorted_df = selection_df.sort_values(by=['samples'], ascending=False)
    sorted_otus = {"otu_ids": list(sorted_df['otu_ids'].values)}
    sorted_samples = {"sample_values": list(sorted_df['samples'].values)}
    for i in range(len(sorted_otus["otu_ids"])):
        sorted_otus["otu_ids"][i] = int(sorted_otus["otu_ids"][i])
    for i in range(len(sorted_samples["sample_values"])):
        sorted_samples["sample_values"][i] = int(sorted_samples["sample_values"][i])
    results = [sorted_otus, sorted_samples, list(all_otus_df["lowest_taxonomic_unit_found"])]
    return jsonify(results)


if __name__ == "__main__":
    app.run(debug=True)
