'use client';

import { Button, Column, Grid, SkeletonText, ToastNotification } from '@carbon/react';

import React, { useEffect, useState } from 'react';
import { Octokit } from '@octokit/core';
import AgentMap from './AgentMap';
import { Add } from '@carbon/react/icons';
import Agent from './Agent';
import { useEnv } from '../providers';
import { getEnv } from '../env';

const octokitClient = new Octokit({});

function AgentsPage() {
  let env = useEnv();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [rows, setRows] = useState([]);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    getAgents();
  }, []);

  const getAgents = async () => {
    if (!env.backendBaseAPI) {
      env = await getEnv();
    }

    try {
      const res = await octokitClient.request(`GET ${env.backendBaseAPI}a/agents`);
      if (res.status === 200) {
        setRows(res.data);
      } else {
        setError('Error obtaining agent data (' + res.status + ')');
      }
    } catch (error) {
      setError('Error obtaining agent data:' + error.message);
      console.error('Error obtaining agent data:', error);
    }
    setLoading(false);
  }

  const reloadAgents = () => {
    setLoading(true);
    getAgents();
  }

  return (
    <Grid>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <h1 className="landing-page__heading">Agents</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Button renderIcon={Add} iconDescription="Add Agent" onClick={() => setOpen(true)}>Add Agent</Button>
        <Agent backendBaseAPI={env.backendBaseAPI} mode="create" agents={rows} agent={null} openState={open} setOpenState={setOpen} onSuccess={reloadAgents} setError={setError} />
      </Column>

      {loading && (
        <Column lg={3} md={2} sm={2}>
          <SkeletonText className="card" paragraph={true} lineCount={2} />
        </Column>
      )}

      {!loading && (<AgentMap backendBaseAPI={env.backendBaseAPI} rows={rows} setRows={setRows} setError={setError} reloadAgents={reloadAgents} />)}

      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        {error && (<ToastNotification role="alert" caption={error} timeout={5000} title="Error" subtitle="" />)}
      </Column>
    </Grid>
  );
}

export default AgentsPage;
