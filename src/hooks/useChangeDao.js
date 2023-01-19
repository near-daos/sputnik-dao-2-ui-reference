const useChangeDao = ({ mutationCtx, routerCtx }) => {
  const handleDaoChange = () => {
    mutationCtx.updateConfig({
      contract: ''
    });
    routerCtx.history.push('/');
  };

  return handleDaoChange;
};

export default useChangeDao;
