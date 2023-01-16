import { useEffect, useState } from "react";
import { useGlobalMutation } from "../utils/container";

export const useDaoList = (props) => {
  const { setShowLoading } = props;
  const mutationCtx = useGlobalMutation();
  const [daoList, setDaoList] = useState();
  useEffect(() => {
    (async () => {
      try {
        const daos = await window.factoryContract.get_daos({
          from_index: Math.floor(props.fromIndex * props.limit),
          limit: props.limit,
        });
        if (daos) {
          setDaoList(daos);
          setShowLoading(false);
        }
      } catch (e) {
        setShowLoading(false);
        mutationCtx.toastError(e);
      }
    })();

    return setDaoList([]);
  }, [props?.fromIndex, props?.limit]);

  return { daoList };
};
