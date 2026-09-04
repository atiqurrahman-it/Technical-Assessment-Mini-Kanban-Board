const WelcomeHero = () => {
  return (
    <div className="flex max-w-2xl flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-4xl font-bold text-[#000855] dark:text-white">
        Customs Analytics
      </h1>
      <h2 className="text-lg font-light tracking-wide text-[#000855] dark:text-white">
        Welcome to the Customs Analytics
      </h2>
      <p className="mt-1 max-w-md text-xs leading-relaxed text-[#000855] dark:text-white">
        You are currently seeing data associated with Fujitsu Limited.
      </p>
    </div>
  );
};

export default WelcomeHero;
