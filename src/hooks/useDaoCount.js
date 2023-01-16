import { useEffect, useState } from 'react';
import { useGlobalMutation } from '../utils/container';

export const useDaoCount = (props) => {
  const { setShowLoading } = props;
  const mutationCtx = useGlobalMutation();
  const [daoCount, setDaoCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const count = await window.factoryContract.get_number_daos();
        if (count) {
          setDaoCount(count);
          setShowLoading(false);
        }
      } catch (e) {
        setShowLoading(false);
        mutationCtx.toastError(e);
      }
    })();

    return setDaoCount(0);
  }, []);

  return { daoCount };
};
