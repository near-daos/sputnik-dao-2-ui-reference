import { useEffect, useState } from 'react';
import { useGlobalMutation } from '../utils/container';

export const useNumberProposals = (props) => {
  const { setShowLoading } = props;
  const mutationCtx = useGlobalMutation();
  const [numberProposals, setNumberProposals] = useState(0);

  const getLastProposalId = async () => {
    return window.contract ? await contract.get_last_proposal_id() : 0;
  };

  useEffect(() => {
    (async () => {
      try {
        const proposalId = await getLastProposalId();
        if (proposalId) {
          setNumberProposals(proposalId);
          setShowLoading(false);
        }
      } catch (e) {
        setShowLoading(false);
        mutationCtx.toastError(e);
      }
    })();

    return () => {
      setNumberProposals(0);
    };
  }, []);

  return { numberProposals };
};
