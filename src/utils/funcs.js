export const yoktoNear = 1000000000000000000000000;
export const proposalsReload = 60000;
export const updatesJsonUrl = 'https://raw.githubusercontent.com/zavodil/sputnik-dao-updates/master/updates.json?t=';

export const timestampToReadable = (timestamp) => {
  let seconds = Number(timestamp / 1e9);
  let d = Math.floor(seconds / (3600 * 24));
  let h = Math.floor(seconds % (3600 * 24) / 3600);
  let m = Math.floor(seconds % 3600 / 60);
  let s = Math.floor(seconds % 60);

  let dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
  let hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
  let mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
  let sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
  return (dDisplay + hDisplay + mDisplay + sDisplay).replace(/,\s*$/, "");
}

export const convertDuration = (duration) => {
  let utcSeconds = duration / 1e9;
  let epoch = new Date(0);
  epoch.setUTCSeconds(utcSeconds);
  return epoch;
}

export const parseForumUrl = (url) => {
  //let afterSlashChars = id.match(/\/([^\/]+)\/?$/)[1];
  let a = url.replace(/\/$/, "").split('/');
  let last = a[a.length - 1];
  let secondLast = a[a.length - 2];
  let category = null;
  let subCategory = null;
  if (/^\d+$/.test(secondLast)) {
    category = secondLast;
    subCategory = last
  } else {
    if (/^\d+$/.test(last)) {
      category = last;
    }
  }

  if (category === null) {
    return url;
  } else {
    return subCategory === null ? "/t/" + category : "/t/" + category + "/" + subCategory;
  }
}






